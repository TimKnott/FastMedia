/* FastMedia ad tag: <div data-fastmedia-ad="footer-banner"></div><script async src="https://www.fastmedia.pro/ad.js"></script> */
(function () {
  var URL = "https://aivnnjsrupmubcjsgulb.supabase.co/rest/v1/rpc/";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdm5uanNydXBtdWJjanNndWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTczOTUsImV4cCI6MjA4NzA3MzM5NX0.UDk0dkl0VsIB9gNqojTUZUqiDOM1-WCNST27ga9lHCA";
  var domain = location.hostname.replace(/^www\./, "");
  function rpc(fn, body) {
    return fetch(URL + fn, { method: "POST", keepalive: true, headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }
  function log(id, zone, ev) { rpc("log_ad_event", { _creative: id, _zone: zone, _domain: domain, _event: ev }).catch(function () {}); }
  function render(el) {
    if (el.getAttribute("data-fm-done")) return;
    el.setAttribute("data-fm-done", "1");
    var zone = el.getAttribute("data-fastmedia-ad");
    rpc("serve_ad", { _zone: zone, _domain: domain }).then(function (r) { return r.json(); }).then(function (rows) {
      var ad = rows && rows[0]; if (!ad) return;
      if (ad.width) { el.style.maxWidth = ad.width + "px"; el.style.minHeight = ad.height + "px"; el.style.margin = "0 auto"; }
      if (ad.type === "image" && ad.image_url) {
        var a = document.createElement("a"); a.href = ad.click_url || "#"; a.target = "_blank"; a.rel = "noopener sponsored";
        var img = document.createElement("img"); img.src = ad.image_url; img.alt = ad.alt_text || "Advertisement"; img.loading = "lazy"; img.style.cssText = "width:100%;height:auto;display:block";
        a.appendChild(img); el.appendChild(a);
      } else if (ad.html) {
        var box = document.createElement("div"); box.innerHTML = ad.html; el.appendChild(box);
        box.querySelectorAll("script").forEach(function (old) {
          var s = document.createElement("script");
          for (var i = 0; i < old.attributes.length; i++) s.setAttribute(old.attributes[i].name, old.attributes[i].value);
          s.text = old.text; old.parentNode.replaceChild(s, old);
        });
      }
      el.addEventListener("click", function () { log(ad.creative_id, zone, "click"); }, { once: true });
      log(ad.creative_id, zone, "impression");
    }).catch(function () {});
  }
  function scan() { document.querySelectorAll("[data-fastmedia-ad]").forEach(render); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan); else scan();
})();
