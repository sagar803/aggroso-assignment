# Prompts Used During Development

This document contains the key prompts used with AI tools (primarily Claude) during the development of this CSV Insights Dashboard. Prompts are organized by feature/component.

### Prompt
```
Problem statement B: CSV Insights Dashboard (small reporting app) Build a web app where I can: * upload a CSV file * preview the data (table view) * generate a short “insights” summary (trends, outliers, what to check next) * save the report and view the last 5 reports * export the report (copy/download)
Make it your own: for example, add simple charts, column selection, or “ask follow-up question” box

i want you to brainstrom on this project 
how can we achieve this

```

### Prompt
```
now i would like you to generate file structure for the project
i will be using react, express, vercel ai for ai query, and shadcn for ui
```

### Prompt
```
now i want you to start with scarfolding next js project, writing files for the project 
i will manually add the shadcn ui like button cards etc
```

### Prompt
```
i want you to do some modifications in our app, it currently seems soo minimal, i want you to add better flow, 

1.  add support for different spreadsheed formats, 
2.  better ux, user uploads file charts and insight generation starts itself
3.  A simple home page with clear steps A status page, that shows health of backend, database, 
1. i want you to use localstorage to store recent work, have unique id per operation,```
```

### Prompt
```
I want you to fix the navigation and the workspace ui , i still do not like the user manually switching tabs, for table chart and insight, there should be some predefined flow for that, 
i want you to first brainstrom with me, the implementation and them move forward
```

### Prompt
```
i would like to proceed with option A, but need a bit of change, 

user uploads the file, data is being analyzed, and insight and charts are being generated, show loading interfacae, minimal yet modern
upon analysis completion, report is view in the ui to the left, and add chatbot slide styled follow up section to the right side of the screen 
i want somthing like this, propose sample ui for this then we move forward with implememtatoin
```