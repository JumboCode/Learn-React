// Creates the first document before react-dom loads; react-dom checks for a DOM once, at import time.
import { resetDocument } from "./dom.js";

resetDocument();
