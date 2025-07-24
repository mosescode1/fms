import Config from "./src/config"

process.on("unhandledRejection", (err: Error) => {
    console.error(`Received unHandled rejection at: ${err}`)
    process.exit(1)
})

process.on("exit", (code) => {
    console.log("Exiting process", code)
})

process.on("uncaughtException", (err: Error) => {
    console.error(`Received uncaught exception at: ${err}`)
    process.exit(1)
})

process.on("warning", (warning) => {
    console.error(`Received warning: ${warning.name} - ${warning.message}`)
    console.error(warning.stack)
})

process.on("beforeExit", (code) => {
    console.log("Before exit process", code)
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