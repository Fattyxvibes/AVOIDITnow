# Policy Rendering Diagnosis

On 25 August 2026, the published `/privacy` route was inspected after a report that its main policy document appeared blank. The page’s policy article had approximately 13,862 characters of text, was visible, had normal opacity, and occupied approximately 5,149 pixels of page height. The complete draft therefore reached the browser DOM, but the document did not visibly render in the article area.

The correction should replace the current streamed Markdown presentation with a direct, deterministic policy renderer that outputs headings, paragraphs, lists, and tables as ordinary accessible HTML. This preserves the existing surrounding legal-page layout while avoiding the visual rendering failure.
