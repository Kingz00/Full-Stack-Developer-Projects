import { marked } from "marked";
import DOMPurify from 'dompurify';

const form = document.querySelector('form');
const input = document.querySelector('input');
const reply = document.querySelector('.reply');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  main(input.value);
  input.value = '';
});

async function main(input) {
  try {
    reply.innerHTML = "Thinking..."

    const res = await fetch('/api', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userInput: input })
    })

    const data = await res.json()

    // convert markdown to HTML
    const html = marked.parse(data.content)

    // Sanitize the HTML to prevent XSS attacks
    const safeHtml = DOMPurify.sanitize(html)

    reply.innerHTML = safeHtml
  } catch (error) {
    console.error('Error in main function.', error.message);
    reply.innerHTML = "Sorry, something went wrong. Please try again.";
  }
}