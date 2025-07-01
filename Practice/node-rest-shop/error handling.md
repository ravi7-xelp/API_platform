When we don't have routes, we
app.use((req, res, next)=>{
    const error = new Error("Not Found");
    error.status = 404; // when we don't found any routes
    next(error); // It forwards error requests here
})

The code to handle all kinds of error

app.use((error,req, res, next)=>{
    res.status(error.status ||500);
    res.json({
        error:{
            message: error.message,
        }
    });
}); //

