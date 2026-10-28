const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path")
const { marked } = require("marked");

const app = express();
const PORT = 3000;
const DOCS_DIR = path.resolve(__dirname,"docs");

function isValidName (name)
{
    return typeof name === "string" && /^[a-zA-Z0-9_-]+$/.test(name)
}
function getDocPath (name)
{
    return path.join(DOCS_DIR, `${name}.md`);
}

app.use(express.json());

app.get("/api/docs", async (req,res) =>
{
    try 
    {
        const files = await fs.readdir(DOCS_DIR);

        const documents = files
            .filter((file) => file.endsWith(".md"))
            .map((file) => path.basename(file,".md"))

        res.json({documents});
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({error: "Cannot read file"});
    }
});

app.post("/api/docs",async (req, res) =>
{
    const {name, markdown} = req.body;

    if(!name || !/^[a-zA-Z0-9_-]+$/.test(name)) 
    {
        return res.status(400).json({error: "ERROR_incorrect_name_document"});
    }
    if(typeof markdown !== "string")
    {
        return res.status(400).json({error: "Markdown must be a string"});
    }

    getDocPath(name);

    try
    {
        await fs.writeFile(filepath,markdown,{encoding: "utf8", flag: "wx"});

        res.status(201).json({message: "Document created", name});
    }
    catch(error)
    {
        if(error.code === "EEXIST")
        {
            return res.status(409).json({error: "Document already exists"});
        }
        console.error(error);
        res.status(500).json({error: "Cannot document created"});
    }
})

app.put("/api/docs", async (req, res) => 
{
    const {name} = req.params;
    const {markdown} = req.body;

    if(!name || !/^[a-zA-Z0-9_-]+$/.test(name)) 
    {
        return res.status(400).json({error: "ERROR_incorrect_name_document"});
    }
    if(typeof markdown !== "string")
    {
        return res.status(400).json({error: "Markdown must be a string"});
    }

    getDocPath(name);
    try 
    {
        await fs.access(filepath);
        await fs.writeFile(filepath, markdown, "utf8");

        res.json({message: "Document Updated!!!"}, name);
    }
    catch(error)
    {
        if (error.code === "ENOENT"){
            return res.status(404).json({error: "Document is not found"})
        }
        console.error(error);
        res.status(500).json({error: "Cannot update document"});
    }
})

app.delete("/api/docs/:name", async (req,res) =>
{
    const {name} = req.params;

    if (!isValidName(name))
    {
        return res.status(400).json({error: "Incorrect document name"});
    }

    getDocPath(name);
    try
    {
        await fs.unlink(filepath);
        res.status(204).end();
    }
    catch(error)
    {
        if (error.code == "ENOENT"){
             return res.status(404).json({error: "Document not found"});
        }
        console.error(error);
        res.status(500).json({error: "Cannot delete document"});
    }
    
})

app.get("/api/docs/:name", async (req,res) =>{
    const name = req.params.name;

    if (!/^[a-zA-Z0-9_-]+$/.test(name))
    {
        return res.status(400).json({error: "Incorrect document name"});
    }

      getDocPath(name);

    try 
    {
        const markdown = await fs.readFile(filepath, "utf8");
        const html = await marked.parse(markdown);

        res.json({
            name, 
            markdown, 
            html});
    }
    catch(error)
    {
        if (error.code == "ENOENT"){
             return res.status(404).json({error: "Document not found"});
        }
        console.error(error);
        res.status(500).json({error: "Server error"});
    }
})

app.get("/", (req,res) => {
    res.redirect("/docs/Index");
})

app.get("/docs/:name", async (req,res) =>
{
    const name = req.params.name;

    if (!/^[a-zA-Z0-9_-]+$/.test(name))
    {
        return res.status(400).send("ERROR_incorrect_name_document");
    }

     getDocPath(name);

    try
    {
        const markdown = await fs.readFile(filepath, "utf8");
        const html = await marked.parse(markdown);


        res.type("html").send(`
        <!doctype html>
        <html lang = "ru">
            <body>${html}</body>
                <head>
                    <meta charset = "UTF-8">
                    <meta name = "viewport"content = "width"=device-width, initial-scale =1">
                        <title>${name}</title>  
                        <style>
                        body {
                            max-width: 800px;
                            margin: 40px auto;
                            padding: 0 20px;
                            font: 16px/1.7 system-ui, sans-serif;
                        }
                        pre {
                            overflow-x: auto;
                            padding: 16px;
                            background: #eae4e4
                        }
                        img {max-width: 100%;}
                    </style>
                </head>
        </html>                      
            `);
    }
    catch(error)
    {
        if (error.code == "ENOENT"){
             return res.status(404).send("Document is not found");
        }
        console.error(error);
        res.status(500).send("Server error");
    }
});
app.listen(PORT,() =>{
    console.log("Server is start");
});

