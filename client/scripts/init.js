function loadScript(src){
    let link = document.createElement('link');
    link.href = src
    link.rel = "preload"
    link.as = "script"
    document.head.append(link)
    return function (){
        return new Promise(function (resolve, reject) {
            let script = document.createElement('script');
            script.src = src
            script.type = 'text/javascript';
            script.async = true;
            script.onload = function(){
                resolve()
            }
            script.onerror = reject
            document.head.append(script);
        })
    }    

}

let server = true

Promise.resolve()
.then(loadScript("https://" + document.domain + "/socket.io/socket.io.js"))
.catch((e) => {
    
})
.then(loadScript("scripts/main.js"))
.then(loadScript("scripts/style.js"))
.then(loadScript("scripts/reSize.js"))
.then(loadScript("scripts/setup.js"))
.then(loadScript("scripts/socket_on.js"))
.then(loadScript("scripts/reDraw.js"))
.then(loadScript("scripts/size_definitions.js"))
.then(() => {
    main()
})