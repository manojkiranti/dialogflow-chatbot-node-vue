(function () {
    var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", "http://localhost:8080/");
    ifrm.setAttribute("name", "nic-asia");
    ifrm.setAttribute("frameborder", "0");
    ifrm.setAttribute("allowtransparency", "true");
    ifrm.setAttribute("allowfullscreen", "true");
    ifrm.setAttribute("scrolling", "auto");
    ifrm.setAttribute("allow", "microphone; geolocation;");
    ifrm.setAttribute("class", "web-chat");
    ifrm.setAttribute("data-testid", "dialog_iframe");
    ifrm.setAttribute("style", "display: inline");

    // ifrm.style.width = "640px";
    // ifrm.style.height = "480px";
    document.body.appendChild(ifrm);

    var ifrmStyle = document.createElement('style');
    ifrmStyle.innerHTML = `
    .web-chat{border:none;visibility:visible;width:323pt;display:none;height:410pt;bottom:-1pt;padding:0;position:fixed;right:0;top:auto;z-index:100}
    .open-frame{position:fixed;width:160px;height:205px;bottom:30px;border:none;right:0;text-align:center;z-index:2}@media screen and (max-width:430px){.web-chat{width:100%;height:100%;border-radius:9pt;bottom:1pt;right:1pt}.cross{bottom:96%}}
    `;
    document.head.appendChild(ifrmStyle);

})();
