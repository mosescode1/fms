import Config from "./src/config"

process.on("unhandledRejection", (err: Error) => {
    console.error(`Received unHandled rejection at: ${err}`)
    process.exit(1)
})

process.on("uncaughtException", (err: Error) => {
    console.error(`Received uncaught exception at: ${err}`)
    process.exit(1)
})

process.on("SIGTERM", () => {
    console.log("shutting down gracefully")
    process.exit(0)
})

process.on("SIGINT", () => {
    console.log("shutting down gracefully")
    process.exit(0)
})

import app from "./src/app"


const port = Config.port

app.listen(port, ()=>{
    console.log("Server started on port", port);
})