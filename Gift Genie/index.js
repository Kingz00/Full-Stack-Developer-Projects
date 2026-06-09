import { autoResizeTextarea, setLoading } from "./utils.js";
import { marked } from "marked";
import DOMPurify from 'dompurify'

// Get UI elements
const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

async function handleGiftRequest(e) {
  // Prevent default form submission
  e.preventDefault();

  // Get user input, trim whitespace, exit if empty
  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  // Set loading state (hides output, animates lamp)
  setLoading(true);

  try {

    const response = await fetch('/api/gift', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userPrompt })
    })

    // // Show output container
    // showStream();

    // Get the response text from the backend
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Server error")
    }

    const giftSuggestions = data.message

    // Convert Markdown to HTML
    const html = marked.parse(giftSuggestions);

    // Sanitize the HTML to prevent XSS attacks
    const safeHTML = DOMPurify.sanitize(html);

    // Render the output
    outputContent.innerHTML = safeHTML;

  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Display friendly error message
    outputContent.textContent =
      "Sorry, I can't access what I need right now. Please try again in a bit.";
  } finally {
    // Always clear loading state (shows output, resets lamp)
    setLoading(false);
  }
}

start();
