import sanitizeHtml from "sanitize-html";

const dirty = `<button onclick="console.log('hacked')">Click me</button>

It started like every normal Monday: half - asleep, grumbling, and brushing my teeth while scrolling through emails.Then I looked up—and nearly dropped my toothbrush into the sink.My reflection blinked < b > before</b > I did.

I stared.It stared back.I waved.It waved, but about a second late, like a badly synced Zoom call from the afterlife.`

console.log(sanitizeHtml(dirty))