import { NextResponse, type NextRequest } from "next/server";
import { createClient, getUserId } from "@/lib/supabase/server";
import { getLesson } from "@/curriculum/lessons";
import { loginPath } from "@/lib/redirect";

const UNIQUE_VIOLATION = "23505";
const RLS_VIOLATION = "42501";

export async function POST(request: NextRequest, { params }: RouteContext<"/lessons/[slug]/complete">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return new NextResponse("Lesson not found", { status: 404 });

  // Unlike Server Actions, Route Handlers get no built-in cross-site check; a form on another site must not be able
  // to complete lessons for a signed-in visitor.
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return new NextResponse("Cross-origin request rejected", { status: 403 });
  }

  const lessonUrl = new URL(`/lessons/${lesson.id}`, request.url);
  const userId = await getUserId();
  if (!userId) return NextResponse.redirect(new URL(loginPath(lessonUrl.pathname), request.url), 303);

  const supabase = await createClient();
  const { error } = await supabase.from("lesson_progress").insert({ user_id: userId, lesson_id: lesson.id });

  if (error?.code === RLS_VIOLATION) lessonUrl.searchParams.set("error", "locked");
  else if (error && error.code !== UNIQUE_VIOLATION) throw error;

  return NextResponse.redirect(lessonUrl, 303);
}
