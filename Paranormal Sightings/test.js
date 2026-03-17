import sanitizeHtml from "sanitize-html";
import { getData } from "./utils/getData.js";

const data = await getData()

const obj = Object.entries(data[0])

console.log(obj)