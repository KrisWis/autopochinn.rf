function t270_scroll(hash, offset, speed) {
  if (hash.indexOf("#!/tproduct/") !== -1 || hash.indexOf("#!/tab/") !== -1) {
    return !0;
  }
  var root = $("html, body");
  var target = "";
  if (speed === undefined) {
    speed = 400;
  }
  try {
    target = $(hash);
  } catch (event) {
    console.log("Exception t270: " + event.message);
    return !0;
  }
  if (target.length === 0) {
    target = $('a[name="' + hash.substr(1) + '"]');
    if (target.length === 0) {
      return !0;
    }
  }
  var isHistoryChangeAllowed = window.location.hash !== hash;
  var complete = function () {
    if (!isHistoryChangeAllowed) {
      return;
    }
    if (history.pushState) {
      history.pushState(null, null, hash);
    } else {
      window.location.hash = hash;
    }
    isHistoryChangeAllowed = !1;
  };
  var dontChangeHistory = Boolean($(".t270").attr("data-history-disabled"));
  if (dontChangeHistory) {
    complete = function () {};
  }
  root.animate({ scrollTop: target.offset().top - offset }, speed, complete);
  return !0;
}
function t396_init(recid) {
  var data = "";
  var res = t396_detectResolution();
  var ab = $("#rec" + recid).find(".t396__artboard");
  window.tn_window_width = $(window).width();
  window.tn_scale_factor =
    Math.round((window.tn_window_width / res) * 100) / 100;
  t396_initTNobj();
  t396_switchResolution(res);
  t396_updateTNobj();
  t396_artboard_build(data, recid);
  $(window).resize(function () {
    tn_console(">>>> t396: Window on Resize event >>>>");
    t396_waitForFinalEvent(
      function () {
        if ($isMobile) {
          var ww = $(window).width();
          if (ww != window.tn_window_width) {
            t396_doResize(recid);
          }
        } else {
          t396_doResize(recid);
        }
      },
      500,
      "resizeruniqueid" + recid
    );
  });
  $(window).on("orientationchange", function () {
    tn_console(">>>> t396: Orient change event >>>>");
    t396_waitForFinalEvent(
      function () {
        t396_doResize(recid);
      },
      600,
      "orientationuniqueid" + recid
    );
  });
  $(window).on("load", function () {
    t396_allelems__renderView(ab);
    if (
      typeof t_lazyload_update === "function" &&
      ab.css("overflow") === "auto"
    ) {
      ab.bind(
        "scroll",
        t_throttle(function () {
          if (
            window.lazy === "y" ||
            $("#allrecords").attr("data-tilda-lazy") === "yes"
          ) {
            t_onFuncLoad("t_lazyload_update", function () {
              t_lazyload_update();
            });
          }
        }, 500)
      );
    }
    if (window.location.hash !== "" && ab.css("overflow") === "visible") {
      ab.css("overflow", "hidden");
      setTimeout(function () {
        ab.css("overflow", "visible");
      }, 1);
    }
  });
  var rec = $("#rec" + recid);
  if (rec.attr("data-connect-with-tab") == "yes") {
    rec.find(".t396").bind("displayChanged", function () {
      var ab = rec.find(".t396__artboard");
      t396_allelems__renderView(ab);
    });
  }
  if (isSafari) rec.find(".t396").addClass("t396_safari");
  var isScaled = t396_ab__getFieldValue(ab, "upscale") === "window";
  var isTildaModeEdit = $("#allrecords").attr("data-tilda-mode") == "edit";
  if (isScaled && !isTildaModeEdit) t396_scaleBlock(recid);
}
function t396_getRotateValue(matrix) {
  var values = matrix.split("(")[1].split(")")[0].split(",");
  var a = values[0];
  var b = values[1];
  var c = values[2];
  var d = values[3];
  var scale = Math.sqrt(a * a + b * b);
  var sin = b / scale;
  var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  return angle;
}
function t396_scaleBlock(recid) {
  var isFirefox = navigator.userAgent.search("Firefox") !== -1;
  var res = t396_detectResolution();
  var rec = $("#rec" + recid);
  var $ab = rec.find(".t396__artboard");
  var abWidth = $ab.width();
  var updatedBlockHeight = Math.floor($ab.height() * window.tn_scale_factor);
  var ab_height_vh = t396_ab__getFieldValue($ab, "height_vh");
  window.tn_scale_offset = (abWidth * window.tn_scale_factor - abWidth) / 2;
  if (ab_height_vh != "") {
    var ab_min_height = t396_ab__getFieldValue($ab, "height");
    var ab_max_height = t396_ab__getHeight($ab);
    var scaledMinHeight = ab_min_height * window.tn_scale_factor;
    updatedBlockHeight =
      scaledMinHeight >= ab_max_height ? scaledMinHeight : ab_max_height;
  }
  $ab.addClass("t396__artboard_scale");
  var scaleStr = isFirefox
    ? "transform: scale(" + window.tn_scale_factor + ") !important;"
    : "zoom: " + window.tn_scale_factor + ";";
  var styleStr =
    '<style class="t396__scale-style">' +
    ".t-rec#rec" +
    recid +
    " { overflow: visible; }" +
    "#rec" +
    recid +
    " .t396__carrier," +
    "#rec" +
    recid +
    " .t396__filter," +
    "#rec" +
    recid +
    " .t396__artboard {" +
    "height: " +
    updatedBlockHeight +
    "px !important;" +
    "width: 100vw !important;" +
    "max-width: 100%;" +
    "}" +
    "<style>";
  $ab.append(styleStr);
  rec.find(".t396__elem").each(function () {
    var $el = $(this);
    var containerProp = t396_elem__getFieldValue($el, "container");
    if (containerProp === "grid") {
      if (isFirefox) {
        var scaleProp = "scale(" + window.tn_scale_factor + ")";
        var transformMatrix = $el.find(".tn-atom").css("transform");
        var rotatation =
          transformMatrix && transformMatrix !== "none"
            ? t396_getRotateValue(transformMatrix)
            : null;
        if (rotatation) {
          if (!$el.find(".tn-atom__sbs-anim-wrapper").length)
            $el.find(".tn-atom").css("transform-origin", "center");
          scaleProp = scaleProp + " rotate(" + rotatation + "deg)";
        }
        $el.find(".tn-atom").css("transform", scaleProp);
      } else {
        $el.css("zoom", window.tn_scale_factor);
        if ($el.attr("data-elem-type") === "text" && res < 1200)
          $el.find(".tn-atom").css("-webkit-text-size-adjust", "auto");
        $el.find(".tn-atom").css("transform-origin", "center");
      }
    }
  });
}
function t396_doResize(recid) {
  var isFirefox = navigator.userAgent.search("Firefox") !== -1;
  var ww;
  var rec = $("#rec" + recid);
  if ($isMobile) {
    ww = $(window).width();
  } else {
    ww = window.innerWidth;
  }
  var res = t396_detectResolution();
  rec.find(".t396__scale-style").remove();
  if (!isFirefox) {
    rec.find(".t396__elem").css("zoom", "");
    rec.find(".t396__elem .tn-atom").css("transform-origin", "");
  }
  var ab = rec.find(".t396__artboard");
  var abWidth = ab.width();
  window.tn_window_width = ww;
  window.tn_scale_factor =
    Math.round((window.tn_window_width / res) * 100) / 100;
  window.tn_scale_offset = (abWidth * window.tn_scale_factor - abWidth) / 2;
  t396_switchResolution(res);
  t396_updateTNobj();
  t396_ab__renderView(ab);
  t396_allelems__renderView(ab);
  var isTildaModeEdit = $("#allrecords").attr("data-tilda-mode") == "edit";
  var isScaled = t396_ab__getFieldValue(ab, "upscale") === "window";
  if (isScaled && !isTildaModeEdit) t396_scaleBlock(recid);
}
function t396_detectResolution() {
  var ww;
  if ($isMobile) {
    ww = $(window).width();
  } else {
    ww = window.innerWidth;
  }
  var res;
  res = 1200;
  if (ww < 1200) {
    res = 960;
  }
  if (ww < 960) {
    res = 640;
  }
  if (ww < 640) {
    res = 480;
  }
  if (ww < 480) {
    res = 320;
  }
  return res;
}
function t396_initTNobj() {
  tn_console("func: initTNobj");
  window.tn = {};
  window.tn.canvas_min_sizes = ["320", "480", "640", "960", "1200"];
  window.tn.canvas_max_sizes = ["480", "640", "960", "1200", ""];
  window.tn.ab_fields = [
    "height",
    "width",
    "bgcolor",
    "bgimg",
    "bgattachment",
    "bgposition",
    "filteropacity",
    "filtercolor",
    "filteropacity2",
    "filtercolor2",
    "height_vh",
    "valign",
  ];
}
function t396_updateTNobj() {
  tn_console("func: updateTNobj");
  if (
    typeof window.zero_window_width_hook != "undefined" &&
    window.zero_window_width_hook == "allrecords" &&
    $("#allrecords").length
  ) {
    window.tn.window_width = parseInt($("#allrecords").width());
  } else {
    window.tn.window_width = parseInt($(window).width());
  }
  if ($isMobile) {
    window.tn.window_height = parseInt($(window).height());
  } else {
    window.tn.window_height = parseInt(window.innerHeight);
  }
  if (window.tn.curResolution == 1200) {
    window.tn.canvas_min_width = 1200;
    window.tn.canvas_max_width = window.tn.window_width;
  }
  if (window.tn.curResolution == 960) {
    window.tn.canvas_min_width = 960;
    window.tn.canvas_max_width = 1200;
  }
  if (window.tn.curResolution == 640) {
    window.tn.canvas_min_width = 640;
    window.tn.canvas_max_width = 960;
  }
  if (window.tn.curResolution == 480) {
    window.tn.canvas_min_width = 480;
    window.tn.canvas_max_width = 640;
  }
  if (window.tn.curResolution == 320) {
    window.tn.canvas_min_width = 320;
    window.tn.canvas_max_width = 480;
  }
  window.tn.grid_width = window.tn.canvas_min_width;
  window.tn.grid_offset_left = parseFloat(
    (window.tn.window_width - window.tn.grid_width) / 2
  );
}
var t396_waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout(timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();
function t396_switchResolution(res, resmax) {
  tn_console("func: switchResolution");
  if (typeof resmax == "undefined") {
    if (res == 1200) resmax = "";
    if (res == 960) resmax = 1200;
    if (res == 640) resmax = 960;
    if (res == 480) resmax = 640;
    if (res == 320) resmax = 480;
  }
  window.tn.curResolution = res;
  window.tn.curResolution_max = resmax;
}
function t396_artboard_build(data, recid) {
  tn_console("func: t396_artboard_build. Recid:" + recid);
  tn_console(data);
  var ab = $("#rec" + recid).find(".t396__artboard");
  t396_ab__renderView(ab);
  ab.find(".tn-elem").each(function () {
    var item = $(this);
    if (item.attr("data-elem-type") == "text") {
      t396_addText(ab, item);
    }
    if (item.attr("data-elem-type") == "image") {
      t396_addImage(ab, item);
    }
    if (item.attr("data-elem-type") == "shape") {
      t396_addShape(ab, item);
    }
    if (item.attr("data-elem-type") == "button") {
      t396_addButton(ab, item);
    }
    if (item.attr("data-elem-type") == "video") {
      t396_addVideo(ab, item);
    }
    if (item.attr("data-elem-type") == "html") {
      t396_addHtml(ab, item);
    }
    if (item.attr("data-elem-type") == "tooltip") {
      t396_addTooltip(ab, item);
    }
    if (item.attr("data-elem-type") == "form") {
      t396_addForm(ab, item);
    }
    if (item.attr("data-elem-type") == "gallery") {
      t396_addGallery(ab, item);
    }
  });
  $("#rec" + recid)
    .find(".t396__artboard")
    .removeClass("rendering")
    .addClass("rendered");
  if (ab.attr("data-artboard-ovrflw") == "visible") {
    $("#allrecords").css("overflow", "hidden");
  }
  if ($isMobile) {
    $("#rec" + recid).append(
      "<style>@media only screen and (min-width:1366px) and (orientation:landscape) and (-webkit-min-device-pixel-ratio:2) {.t396__carrier {background-attachment:scroll!important;}}</style>"
    );
  }
}
function t396_ab__renderView(ab) {
  var fields = window.tn.ab_fields;
  for (var i = 0; i < fields.length; i++) {
    t396_ab__renderViewOneField(ab, fields[i]);
  }
  var ab_min_height = t396_ab__getFieldValue(ab, "height");
  var ab_max_height = t396_ab__getHeight(ab);
  var isTildaModeEdit = $("#allrecords").attr("data-tilda-mode") == "edit";
  var isScaled = t396_ab__getFieldValue(ab, "upscale") === "window";
  var ab_height_vh = t396_ab__getFieldValue(ab, "height_vh");
  if (isScaled && !isTildaModeEdit && ab_height_vh != "")
    var scaledMinHeight = parseInt(ab_min_height, 10) * window.tn_scale_factor;
  var offset_top = 0;
  if (
    ab_min_height == ab_max_height ||
    (scaledMinHeight && scaledMinHeight >= ab_max_height)
  ) {
    offset_top = 0;
  } else {
    var ab_valign = t396_ab__getFieldValue(ab, "valign");
    if (ab_valign == "top") {
      offset_top = 0;
    } else if (ab_valign == "center") {
      if (scaledMinHeight) {
        offset_top = parseFloat((ab_max_height - scaledMinHeight) / 2).toFixed(
          1
        );
      } else {
        offset_top = parseFloat((ab_max_height - ab_min_height) / 2).toFixed(1);
      }
    } else if (ab_valign == "bottom") {
      if (scaledMinHeight) {
        offset_top = parseFloat(ab_max_height - scaledMinHeight).toFixed(1);
      } else {
        offset_top = parseFloat(ab_max_height - ab_min_height).toFixed(1);
      }
    } else if (ab_valign == "stretch") {
      offset_top = 0;
      ab_min_height = ab_max_height;
    } else {
      offset_top = 0;
    }
  }
  ab.attr("data-artboard-proxy-min-offset-top", offset_top);
  ab.attr("data-artboard-proxy-min-height", ab_min_height);
  ab.attr("data-artboard-proxy-max-height", ab_max_height);
  var filter = ab.find(".t396__filter");
  var carrier = ab.find(".t396__carrier");
  var abHeightVh = t396_ab__getFieldValue(ab, "height_vh");
  abHeightVh = parseFloat(abHeightVh);
  if (window.isMobile && abHeightVh) {
    var height =
      document.documentElement.clientHeight * parseFloat(abHeightVh / 100);
    ab.css("height", height);
    filter.css("height", height);
    carrier.css("height", height);
  }
}
function t396_addText(ab, el) {
  tn_console("func: addText");
  var fields_str =
    "top,left,width,container,axisx,axisy,widthunits,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
}
function t396_addImage(ab, el) {
  tn_console("func: addImage");
  var fields_str =
    "img,width,filewidth,fileheight,top,left,container,axisx,axisy,widthunits,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
  el.find("img")
    .on("load", function () {
      t396_elem__renderViewOneField(el, "top");
      if (
        typeof $(this).attr("src") != "undefined" &&
        $(this).attr("src") != ""
      ) {
        setTimeout(function () {
          t396_elem__renderViewOneField(el, "top");
        }, 2000);
      }
    })
    .each(function () {
      if (this.complete) $(this).trigger("load");
    });
  el.find("img").on("tuwidget_done", function (e, file) {
    t396_elem__renderViewOneField(el, "top");
  });
}
function t396_addShape(ab, el) {
  tn_console("func: addShape");
  var fields_str = "width,height,top,left,";
  fields_str +=
    "container,axisx,axisy,widthunits,heightunits,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
}
function t396_addButton(ab, el) {
  tn_console("func: addButton");
  var fields_str =
    "top,left,width,height,container,axisx,axisy,caption,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
  return el;
}
function t396_addVideo(ab, el) {
  tn_console("func: addVideo");
  var fields_str = "width,height,top,left,";
  fields_str +=
    "container,axisx,axisy,widthunits,heightunits,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
  var viel = el.find(".tn-atom__videoiframe");
  var viatel = el.find(".tn-atom");
  viatel.css("background-color", "#000");
  var vihascover = viatel.attr("data-atom-video-has-cover");
  if (typeof vihascover == "undefined") {
    vihascover = "";
  }
  if (vihascover == "y") {
    viatel.click(function () {
      var viifel = viel.find("iframe");
      if (viifel.length) {
        var foo = viifel.attr("data-original");
        viifel.attr("src", foo);
      }
      viatel.css("background-image", "none");
      viatel.find(".tn-atom__video-play-link").css("display", "none");
    });
  }
  var autoplay = t396_elem__getFieldValue(el, "autoplay");
  var showinfo = t396_elem__getFieldValue(el, "showinfo");
  var loop = t396_elem__getFieldValue(el, "loop");
  var mute = t396_elem__getFieldValue(el, "mute");
  var startsec = t396_elem__getFieldValue(el, "startsec");
  var endsec = t396_elem__getFieldValue(el, "endsec");
  var tmode = $("#allrecords").attr("data-tilda-mode");
  var url = "";
  var viyid = viel.attr("data-youtubeid");
  if (typeof viyid != "undefined" && viyid != "") {
    url = "//youtube.com/embed/";
    url += viyid + "?rel=0&fmt=18&html5=1";
    url += "&showinfo=" + (showinfo == "y" ? "1" : "0");
    if (loop == "y") {
      url += "&loop=1&playlist=" + viyid;
    }
    if (startsec > 0) {
      url += "&start=" + startsec;
    }
    if (endsec > 0) {
      url += "&end=" + endsec;
    }
    if (mute == "y") {
      url += "&mute=1";
    }
    if (vihascover == "y") {
      url += "&autoplay=1";
      var instFlag = "y";
      var iframeClass = "";
      if (autoplay == "y" && mute == "y" && window.lazy == "y") {
        instFlag = "lazy";
        iframeClass = ' class="t-iframe"';
      }
      viel.html(
        '<iframe id="youtubeiframe"' +
          iframeClass +
          ' width="100%" height="100%" data-original="' +
          url +
          '" frameborder="0" allowfullscreen data-flag-inst="' +
          instFlag +
          '"></iframe>'
      );
      if (autoplay == "y" && mute == "y" && window.lazy == "y") {
        el.append(
          '<script>lazyload_iframe = new LazyLoad({elements_selector: ".t-iframe"});</script>'
        );
      }
      if (autoplay == "y" && mute == "y") {
        viatel.trigger("click");
      }
    } else {
      if (typeof tmode != "undefined" && tmode == "edit") {
      } else {
        if (autoplay == "y") {
          url += "&autoplay=1";
        }
      }
      if (window.lazy == "y") {
        viel.html(
          '<iframe id="youtubeiframe" class="t-iframe" width="100%" height="100%" data-original="' +
            url +
            '" frameborder="0" allowfullscreen data-flag-inst="lazy"></iframe>'
        );
        el.append(
          '<script>lazyload_iframe = new LazyLoad({elements_selector: ".t-iframe"});</script>'
        );
      } else {
        viel.html(
          '<iframe id="youtubeiframe" width="100%" height="100%" src="' +
            url +
            '" frameborder="0" allowfullscreen data-flag-inst="y"></iframe>'
        );
      }
    }
  }
  var vivid = viel.attr("data-vimeoid");
  if (typeof vivid != "undefined" && vivid > 0) {
    url = "//player.vimeo.com/video/";
    url += vivid + "?color=ffffff&badge=0";
    if (showinfo == "y") {
      url += "&title=1&byline=1&portrait=1";
    } else {
      url += "&title=0&byline=0&portrait=0";
    }
    if (loop == "y") {
      url += "&loop=1";
    }
    if (mute == "y") {
      url += "&muted=1";
    }
    if (vihascover == "y") {
      url += "&autoplay=1";
      viel.html(
        '<iframe data-original="' +
          url +
          '" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
      );
    } else {
      if (typeof tmode != "undefined" && tmode == "edit") {
      } else {
        if (autoplay == "y") {
          url += "&autoplay=1";
        }
      }
      if (window.lazy == "y") {
        viel.html(
          '<iframe class="t-iframe" data-original="' +
            url +
            '" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
        );
        el.append(
          '<script>lazyload_iframe = new LazyLoad({elements_selector: ".t-iframe"});</script>'
        );
      } else {
        viel.html(
          '<iframe src="' +
            url +
            '" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
        );
      }
    }
  }
}
function t396_addHtml(ab, el) {
  tn_console("func: addHtml");
  var fields_str = "width,height,top,left,";
  fields_str +=
    "container,axisx,axisy,widthunits,heightunits,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
}
function t396_addTooltip(ab, el) {
  tn_console("func: addTooltip");
  var fields_str = "width,height,top,left,";
  fields_str +=
    "container,axisx,axisy,widthunits,heightunits,leftunits,topunits,tipposition";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
  var pinEl = el.find(".tn-atom__pin");
  var tipEl = el.find(".tn-atom__tip");
  var tipopen = el.attr("data-field-tipopen-value");
  if (isMobile || (typeof tipopen != "undefined" && tipopen == "click")) {
    t396_setUpTooltip_mobile(el, pinEl, tipEl);
  } else {
    t396_setUpTooltip_desktop(el, pinEl, tipEl);
  }
  setTimeout(function () {
    $(".tn-atom__tip-img").each(function () {
      var foo = $(this).attr("data-tipimg-original");
      if (typeof foo != "undefined" && foo != "") {
        $(this).attr("src", foo);
      }
    });
  }, 3000);
}
function t396_addForm(ab, el) {
  tn_console("func: addForm");
  var fields_str = "width,top,left,";
  fields_str += "inputs,container,axisx,axisy,widthunits,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
}
function t396_addGallery(ab, el) {
  tn_console("func: addForm");
  var fields_str = "width,height,top,left,";
  fields_str +=
    "imgs,container,axisx,axisy,widthunits,heightunits,leftunits,topunits";
  var fields = fields_str.split(",");
  el.attr("data-fields", fields_str);
  t396_elem__renderView(el);
}
function t396_elem__setFieldValue(
  el,
  prop,
  val,
  flag_render,
  flag_updateui,
  res
) {
  if (res == "") res = window.tn.curResolution;
  if (res < 1200 && prop != "zindex") {
    el.attr("data-field-" + prop + "-res-" + res + "-value", val);
  } else {
    el.attr("data-field-" + prop + "-value", val);
  }
  if (flag_render == "render") elem__renderViewOneField(el, prop);
  if (flag_updateui == "updateui") panelSettings__updateUi(el, prop, val);
}
function t396_elem__getFieldValue(el, prop) {
  var res = window.tn.curResolution;
  var r;
  if (res < 1200) {
    if (res == 960) {
      r = el.attr("data-field-" + prop + "-res-960-value");
      if (typeof r == "undefined") {
        r = el.attr("data-field-" + prop + "-value");
      }
    }
    if (res == 640) {
      r = el.attr("data-field-" + prop + "-res-640-value");
      if (typeof r == "undefined") {
        r = el.attr("data-field-" + prop + "-res-960-value");
        if (typeof r == "undefined") {
          r = el.attr("data-field-" + prop + "-value");
        }
      }
    }
    if (res == 480) {
      r = el.attr("data-field-" + prop + "-res-480-value");
      if (typeof r == "undefined") {
        r = el.attr("data-field-" + prop + "-res-640-value");
        if (typeof r == "undefined") {
          r = el.attr("data-field-" + prop + "-res-960-value");
          if (typeof r == "undefined") {
            r = el.attr("data-field-" + prop + "-value");
          }
        }
      }
    }
    if (res == 320) {
      r = el.attr("data-field-" + prop + "-res-320-value");
      if (typeof r == "undefined") {
        r = el.attr("data-field-" + prop + "-res-480-value");
        if (typeof r == "undefined") {
          r = el.attr("data-field-" + prop + "-res-640-value");
          if (typeof r == "undefined") {
            r = el.attr("data-field-" + prop + "-res-960-value");
            if (typeof r == "undefined") {
              r = el.attr("data-field-" + prop + "-value");
            }
          }
        }
      }
    }
  } else {
    r = el.attr("data-field-" + prop + "-value");
  }
  return r;
}
function t396_elem__renderView(el) {
  tn_console("func: elem__renderView");
  var fields = el.attr("data-fields");
  if (!fields) {
    return !1;
  }
  fields = fields.split(",");
  for (var i = 0; i < fields.length; i++) {
    t396_elem__renderViewOneField(el, fields[i]);
  }
}
function t396_elem__renderViewOneField(el, field) {
  var value = t396_elem__getFieldValue(el, field);
  if (field == "left") {
    value = t396_elem__convertPosition__Local__toAbsolute(el, field, value);
    el.css("left", parseFloat(value).toFixed(1) + "px");
  }
  if (field == "top") {
    var ab = el.parents(".t396__artboard");
    value = t396_elem__convertPosition__Local__toAbsolute(el, field, value);
    el.css("top", parseFloat(value).toFixed(1) + "px");
  }
  if (field == "width") {
    value = t396_elem__getWidth(el, value);
    el.css("width", parseFloat(value).toFixed(1) + "px");
    var eltype = el.attr("data-elem-type");
    if (eltype == "tooltip") {
      var pinSvgIcon = el.find(".tn-atom__pin-icon");
      if (pinSvgIcon.length > 0) {
        var pinSize = parseFloat(value).toFixed(1) + "px";
        pinSvgIcon.css({ width: pinSize, height: pinSize });
      }
      el.css("height", parseInt(value).toFixed(1) + "px");
    }
    if (eltype == "gallery") {
      var borderWidth = t396_elem__getFieldValue(el, "borderwidth");
      var borderStyle = t396_elem__getFieldValue(el, "borderstyle");
      if (
        borderStyle == "none" ||
        typeof borderStyle == "undefined" ||
        typeof borderWidth == "undefined" ||
        borderWidth == ""
      )
        borderWidth = 0;
      value = value * 1 - borderWidth * 2;
      el.css("width", parseFloat(value).toFixed(1) + "px");
      el.find(".t-slds__main").css(
        "width",
        parseFloat(value).toFixed(1) + "px"
      );
      el.find(".tn-atom__slds-img").css(
        "width",
        parseFloat(value).toFixed(1) + "px"
      );
    }
  }
  if (field == "height") {
    var eltype = el.attr("data-elem-type");
    if (eltype == "tooltip") {
      return;
    }
    value = t396_elem__getHeight(el, value);
    el.css("height", parseFloat(value).toFixed(1) + "px");
    if (eltype === "gallery") {
      var borderWidth = t396_elem__getFieldValue(el, "borderwidth");
      var borderStyle = t396_elem__getFieldValue(el, "borderstyle");
      if (
        borderStyle == "none" ||
        typeof borderStyle == "undefined" ||
        typeof borderWidth == "undefined" ||
        borderWidth == ""
      )
        borderWidth = 0;
      value = value * 1 - borderWidth * 2;
      el.css("height", parseFloat(value).toFixed(1) + "px");
      el.find(".tn-atom__slds-img").css(
        "height",
        parseFloat(value).toFixed(1) + "px"
      );
      el.find(".t-slds__main").css(
        "height",
        parseFloat(value).toFixed(1) + "px"
      );
    }
  }
  if (field == "container") {
    t396_elem__renderViewOneField(el, "left");
    t396_elem__renderViewOneField(el, "top");
  }
  if (
    field == "width" ||
    field == "height" ||
    field == "fontsize" ||
    field == "fontfamily" ||
    field == "letterspacing" ||
    field == "fontweight" ||
    field == "img"
  ) {
    t396_elem__renderViewOneField(el, "left");
    t396_elem__renderViewOneField(el, "top");
  }
  if (field == "inputs") {
    value = el.find(".tn-atom__inputs-textarea").val();
    try {
      t_zeroForms__renderForm(el, value);
    } catch (err) {}
  }
}
function t396_elem__convertPosition__Local__toAbsolute(el, field, value) {
  var ab = el.parents(".t396__artboard");
  var blockVAlign = t396_ab__getFieldValue(ab, "valign");
  var isScaled = t396_ab__getFieldValue(ab, "upscale") === "window";
  var isTildaModeEdit = $("#allrecords").attr("data-tilda-mode") == "edit";
  var isFirefox = navigator.userAgent.search("Firefox") !== -1;
  var isScaledFirefox = !isTildaModeEdit && isScaled && isFirefox;
  var isScaledNotFirefox = !isTildaModeEdit && isScaled && !isFirefox;
  var el_axisy = t396_elem__getFieldValue(el, "axisy");
  value = parseInt(value);
  if (field == "left") {
    var el_container, offset_left, el_container_width, el_width;
    var container = t396_elem__getFieldValue(el, "container");
    if (container === "grid") {
      el_container = "grid";
      offset_left = window.tn.grid_offset_left;
      el_container_width = window.tn.grid_width;
    } else {
      el_container = "window";
      offset_left = 0;
      el_container_width = window.tn.window_width;
    }
    var el_leftunits = t396_elem__getFieldValue(el, "leftunits");
    if (el_leftunits === "%") {
      value = t396_roundFloat((el_container_width * value) / 100);
    }
    if (!isTildaModeEdit && isScaled) {
      if (container === "grid" && isFirefox)
        value = value * window.tn_scale_factor;
    } else {
      value = offset_left + value;
    }
    var el_axisx = t396_elem__getFieldValue(el, "axisx");
    if (el_axisx === "center") {
      el_width = t396_elem__getWidth(el);
      if (isScaledFirefox && el_container !== "window") {
        el_container_width *= window.tn_scale_factor;
        el_width *= window.tn_scale_factor;
      }
      value = el_container_width / 2 - el_width / 2 + value;
    }
    if (el_axisx === "right") {
      el_width = t396_elem__getWidth(el);
      if (isScaledFirefox && el_container !== "window") {
        el_container_width *= window.tn_scale_factor;
        el_width *= window.tn_scale_factor;
      }
      value = el_container_width - el_width + value;
    }
  }
  if (field === "top") {
    var el_container, offset_top, el_container_height, el_height;
    var ab = el.parent();
    var container = t396_elem__getFieldValue(el, "container");
    if (container === "grid") {
      el_container = "grid";
      offset_top = parseFloat(ab.attr("data-artboard-proxy-min-offset-top"));
      el_container_height = parseFloat(
        ab.attr("data-artboard-proxy-min-height")
      );
    } else {
      el_container = "window";
      offset_top = 0;
      el_container_height = parseFloat(
        ab.attr("data-artboard-proxy-max-height")
      );
    }
    var el_topunits = t396_elem__getFieldValue(el, "topunits");
    if (el_topunits === "%") {
      value = el_container_height * (value / 100);
    }
    if (isScaledFirefox && el_container !== "window") {
      value *= window.tn_scale_factor;
    }
    if (isScaledNotFirefox && el_container !== "window") {
      offset_top =
        blockVAlign === "stretch" ? 0 : offset_top / window.tn_scale_factor;
    }
    value = offset_top + value;
    var ab_height_vh = t396_ab__getFieldValue(ab, "height_vh");
    var ab_min_height = t396_ab__getFieldValue(ab, "height");
    var ab_max_height = t396_ab__getHeight(ab);
    if (isScaled && !isTildaModeEdit && ab_height_vh != "") {
      var scaledMinHeight =
        parseInt(ab_min_height, 10) * window.tn_scale_factor;
    }
    if (el_axisy === "center") {
      el_height = t396_elem__getHeight(el);
      if (el.attr("data-elem-type") === "image") {
        el_width = t396_elem__getWidth(el);
        var fileWidth = t396_elem__getFieldValue(el, "filewidth");
        var fileHeight = t396_elem__getFieldValue(el, "fileheight");
        if (fileWidth && fileHeight) {
          var ratio = parseInt(fileWidth) / parseInt(fileHeight);
          el_height = el_width / ratio;
        }
      }
      if (isScaledFirefox && el_container !== "window") {
        if (blockVAlign !== "stretch") {
          el_container_height = el_container_height * window.tn_scale_factor;
        } else {
          if (scaledMinHeight) {
            el_container_height =
              scaledMinHeight > ab_max_height ? scaledMinHeight : ab_max_height;
          } else {
            el_container_height = ab.height();
          }
        }
        el_height *= window.tn_scale_factor;
      }
      if (
        !isTildaModeEdit &&
        isScaled &&
        !isFirefox &&
        el_container !== "window" &&
        blockVAlign === "stretch"
      ) {
        if (scaledMinHeight) {
          el_container_height =
            scaledMinHeight > ab_max_height ? scaledMinHeight : ab_max_height;
        } else {
          el_container_height = ab.height();
        }
        el_container_height = el_container_height / window.tn_scale_factor;
      }
      value = el_container_height / 2 - el_height / 2 + value;
    }
    if (el_axisy === "bottom") {
      el_height = t396_elem__getHeight(el);
      if (el.attr("data-elem-type") === "image") {
        el_width = t396_elem__getWidth(el);
        var fileWidth = t396_elem__getFieldValue(el, "filewidth");
        var fileHeight = t396_elem__getFieldValue(el, "fileheight");
        if (fileWidth && fileHeight) {
          var ratio = parseInt(fileWidth) / parseInt(fileHeight);
          el_height = el_width / ratio;
        }
      }
      if (isScaledFirefox && el_container !== "window") {
        if (blockVAlign !== "stretch") {
          el_container_height = el_container_height * window.tn_scale_factor;
        } else {
          if (scaledMinHeight) {
            el_container_height =
              scaledMinHeight > ab_max_height ? scaledMinHeight : ab_max_height;
          } else {
            el_container_height = ab.height();
          }
        }
        el_height *= window.tn_scale_factor;
      }
      if (
        !isTildaModeEdit &&
        isScaled &&
        !isFirefox &&
        el_container !== "window" &&
        blockVAlign === "stretch"
      ) {
        if (scaledMinHeight) {
          el_container_height =
            scaledMinHeight > ab_max_height ? scaledMinHeight : ab_max_height;
        } else {
          el_container_height = ab.height();
        }
        el_container_height = el_container_height / window.tn_scale_factor;
      }
      value = el_container_height - el_height + value;
    }
  }
  return value;
}
function t396_ab__setFieldValue(ab, prop, val, res) {
  if (res == "") res = window.tn.curResolution;
  if (res < 1200) {
    ab.attr("data-artboard-" + prop + "-res-" + res, val);
  } else {
    ab.attr("data-artboard-" + prop, val);
  }
}
function t396_ab__getFieldValue(ab, prop) {
  var res = window.tn.curResolution;
  var r;
  if (res < 1200) {
    if (res == 960) {
      r = ab.attr("data-artboard-" + prop + "-res-960");
      if (typeof r == "undefined") {
        r = ab.attr("data-artboard-" + prop + "");
      }
    }
    if (res == 640) {
      r = ab.attr("data-artboard-" + prop + "-res-640");
      if (typeof r == "undefined") {
        r = ab.attr("data-artboard-" + prop + "-res-960");
        if (typeof r == "undefined") {
          r = ab.attr("data-artboard-" + prop + "");
        }
      }
    }
    if (res == 480) {
      r = ab.attr("data-artboard-" + prop + "-res-480");
      if (typeof r == "undefined") {
        r = ab.attr("data-artboard-" + prop + "-res-640");
        if (typeof r == "undefined") {
          r = ab.attr("data-artboard-" + prop + "-res-960");
          if (typeof r == "undefined") {
            r = ab.attr("data-artboard-" + prop + "");
          }
        }
      }
    }
    if (res == 320) {
      r = ab.attr("data-artboard-" + prop + "-res-320");
      if (typeof r == "undefined") {
        r = ab.attr("data-artboard-" + prop + "-res-480");
        if (typeof r == "undefined") {
          r = ab.attr("data-artboard-" + prop + "-res-640");
          if (typeof r == "undefined") {
            r = ab.attr("data-artboard-" + prop + "-res-960");
            if (typeof r == "undefined") {
              r = ab.attr("data-artboard-" + prop + "");
            }
          }
        }
      }
    }
  } else {
    r = ab.attr("data-artboard-" + prop);
  }
  return r;
}
function t396_ab__renderViewOneField(ab, field) {
  var value = t396_ab__getFieldValue(ab, field);
}
function t396_allelems__renderView(ab) {
  tn_console(
    "func: allelems__renderView: abid:" + ab.attr("data-artboard-recid")
  );
  ab.find(".tn-elem").each(function () {
    t396_elem__renderView($(this));
  });
}
function t396_ab__filterUpdate(ab) {
  var filter = ab.find(".t396__filter");
  var c1 = filter.attr("data-filtercolor-rgb");
  var c2 = filter.attr("data-filtercolor2-rgb");
  var o1 = filter.attr("data-filteropacity");
  var o2 = filter.attr("data-filteropacity2");
  if (
    (typeof c2 == "undefined" || c2 == "") &&
    typeof c1 != "undefined" &&
    c1 != ""
  ) {
    filter.css("background-color", "rgba(" + c1 + "," + o1 + ")");
  } else if (
    (typeof c1 == "undefined" || c1 == "") &&
    typeof c2 != "undefined" &&
    c2 != ""
  ) {
    filter.css("background-color", "rgba(" + c2 + "," + o2 + ")");
  } else if (
    typeof c1 != "undefined" &&
    typeof c2 != "undefined" &&
    c1 != "" &&
    c2 != ""
  ) {
    filter.css({
      background:
        "-webkit-gradient(linear, left top, left bottom, from(rgba(" +
        c1 +
        "," +
        o1 +
        ")), to(rgba(" +
        c2 +
        "," +
        o2 +
        ")) )",
    });
  } else {
    filter.css("background-color", "transparent");
  }
}
function t396_ab__getHeight(ab, ab_height) {
  if (typeof ab_height == "undefined")
    ab_height = t396_ab__getFieldValue(ab, "height");
  ab_height = parseFloat(ab_height);
  var ab_height_vh = t396_ab__getFieldValue(ab, "height_vh");
  if (ab_height_vh != "") {
    ab_height_vh = parseFloat(ab_height_vh);
    if (isNaN(ab_height_vh) === !1) {
      var ab_height_vh_px = parseFloat(
        window.tn.window_height * parseFloat(ab_height_vh / 100)
      );
      if (ab_height < ab_height_vh_px) {
        ab_height = ab_height_vh_px;
      }
    }
  }
  return ab_height;
}
function t396_hex2rgb(hexStr) {
  var hex = parseInt(hexStr.substring(1), 16);
  var r = (hex & 0xff0000) >> 16;
  var g = (hex & 0x00ff00) >> 8;
  var b = hex & 0x0000ff;
  return [r, g, b];
}
String.prototype.t396_replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};
function t396_elem__getWidth(el, value) {
  if (typeof value == "undefined")
    value = parseFloat(t396_elem__getFieldValue(el, "width"));
  var el_widthunits = t396_elem__getFieldValue(el, "widthunits");
  if (el_widthunits == "%") {
    var el_container = t396_elem__getFieldValue(el, "container");
    if (el_container == "window") {
      value = parseFloat(
        window.tn.window_width * parseFloat(parseInt(value) / 100)
      );
    } else {
      value = parseFloat(
        window.tn.grid_width * parseFloat(parseInt(value) / 100)
      );
    }
  }
  return value;
}
function t396_elem__getHeight(el, value) {
  if (typeof value == "undefined")
    value = t396_elem__getFieldValue(el, "height");
  value = parseFloat(value);
  if (
    el.attr("data-elem-type") == "shape" ||
    el.attr("data-elem-type") == "video" ||
    el.attr("data-elem-type") == "html" ||
    el.attr("data-elem-type") == "gallery"
  ) {
    var el_heightunits = t396_elem__getFieldValue(el, "heightunits");
    if (el_heightunits == "%") {
      var ab = el.parent();
      var ab_min_height = parseFloat(ab.attr("data-artboard-proxy-min-height"));
      var ab_max_height = parseFloat(ab.attr("data-artboard-proxy-max-height"));
      var el_container = t396_elem__getFieldValue(el, "container");
      if (el_container == "window") {
        value = parseFloat(ab_max_height * parseFloat(value / 100));
      } else {
        value = parseFloat(ab_min_height * parseFloat(value / 100));
      }
    }
  } else if (el.attr("data-elem-type") == "button") {
    value = value;
  } else {
    value = parseFloat(el.innerHeight());
  }
  return value;
}
function t396_roundFloat(n) {
  n = Math.round(n * 100) / 100;
  return n;
}
function tn_console(str) {
  if (window.tn_comments == 1) console.log(str);
}
function t396_setUpTooltip_desktop(el, pinEl, tipEl) {
  var timer;
  pinEl.mouseover(function () {
    $(".tn-atom__tip_visible").each(function () {
      var thisTipEl = $(this).parents(".t396__elem");
      if (thisTipEl.attr("data-elem-id") != el.attr("data-elem-id")) {
        t396_hideTooltip(thisTipEl, $(this));
      }
    });
    clearTimeout(timer);
    if (tipEl.css("display") == "block") {
      return;
    }
    t396_showTooltip(el, tipEl);
  });
  pinEl.mouseout(function () {
    timer = setTimeout(function () {
      t396_hideTooltip(el, tipEl);
    }, 300);
  });
}
function t396_setUpTooltip_mobile(el, pinEl, tipEl) {
  pinEl.on("click", function (e) {
    if (
      tipEl.css("display") == "block" &&
      $(e.target).hasClass("tn-atom__pin")
    ) {
      t396_hideTooltip(el, tipEl);
    } else {
      t396_showTooltip(el, tipEl);
    }
  });
  var id = el.attr("data-elem-id");
  $(document).click(function (e) {
    var isInsideTooltip =
      $(e.target).hasClass("tn-atom__pin") ||
      $(e.target).parents(".tn-atom__pin").length > 0;
    if (isInsideTooltip) {
      var clickedPinId = $(e.target)
        .parents(".t396__elem")
        .attr("data-elem-id");
      if (clickedPinId == id) {
        return;
      }
    }
    t396_hideTooltip(el, tipEl);
  });
}
function t396_hideTooltip(el, tipEl) {
  tipEl.css("display", "");
  tipEl.css({ left: "", transform: "", right: "" });
  tipEl.removeClass("tn-atom__tip_visible");
  el.css("z-index", "");
}
function t396_showTooltip(el, tipEl) {
  var pos = el.attr("data-field-tipposition-value");
  if (typeof pos == "undefined" || pos == "") {
    pos = "top";
  }
  var elSize = el.height();
  var elTop = el.offset().top;
  var elBottom = elTop + elSize;
  var elLeft = el.offset().left;
  var elRight = el.offset().left + elSize;
  var winTop = $(window).scrollTop();
  var winWidth = $(window).width();
  var winBottom = winTop + $(window).height();
  var tipElHeight = tipEl.outerHeight();
  var tipElWidth = tipEl.outerWidth();
  var padd = 15;
  if (pos == "right" || pos == "left") {
    var tipElRight = elRight + padd + tipElWidth;
    var tipElLeft = elLeft - padd - tipElWidth;
    if (
      (pos == "right" && tipElRight > winWidth) ||
      (pos == "left" && tipElLeft < 0)
    ) {
      pos = "top";
    }
  }
  if (pos == "top" || pos == "bottom") {
    var tipElRight = elRight + (tipElWidth / 2 - elSize / 2);
    var tipElLeft = elLeft - (tipElWidth / 2 - elSize / 2);
    if (tipElRight > winWidth) {
      var rightOffset = -(winWidth - elRight - padd);
      tipEl.css({ left: "auto", transform: "none", right: rightOffset + "px" });
    }
    if (tipElLeft < 0) {
      var leftOffset = -(elLeft - padd);
      tipEl.css({ left: leftOffset + "px", transform: "none" });
    }
  }
  if (pos == "top") {
    var tipElTop = elTop - padd - tipElHeight;
    var tipElBottom = elBottom + padd + tipElHeight;
    if (winBottom > tipElBottom && winTop > tipElTop) {
      pos = "bottom";
    }
  }
  if (pos == "bottom") {
    var tipElTop = elTop - padd - tipElHeight;
    var tipElBottom = elBottom + padd + tipElHeight;
    if (winBottom < tipElBottom && winTop < tipElTop) {
      pos = "top";
    }
  }
  tipEl.attr("data-tip-pos", pos);
  tipEl.css("display", "block");
  tipEl.addClass("tn-atom__tip_visible");
  el.css("z-index", "1000");
}
function t396_hex2rgba(hexStr, opacity) {
  var hex = parseInt(hexStr.substring(1), 16);
  var r = (hex & 0xff0000) >> 16;
  var g = (hex & 0x00ff00) >> 8;
  var b = hex & 0x0000ff;
  return [r, g, b, parseFloat(opacity)];
}
function t400_init(recid) {
  var el = $("#rec" + recid);
  var btn = el.find(".t400__submit");
  var hideBackText = btn.attr("data-hide-back-text");
  var showMoreText = btn.text();
  el.find(".t400__submit").click(function () {
    if (
      typeof hideBackText != "undefined" &&
      hideBackText.length > 0 &&
      $(this).hasClass("t400__submit_hide-back")
    ) {
      t400_alltabs_updateContent(recid);
      $(this).removeClass("t400__submit_hide-back");
      if (btn.hasClass("t400__submit-overflowed")) {
        btn.html('<span class="t400__text">' + showMoreText + "</span>");
      } else {
        btn.html(showMoreText);
      }
      $(".t396").trigger("displayChanged");
      return;
    }
    var recids = $(this).attr("data-hidden-rec-ids").split(",");
    recids.forEach(function (recid) {
      var el = $("#rec" + recid);
      el.removeClass("t400__off");
      el.css("opacity", "");
      var video = el.find(".t-video-lazyload");
      if (video.length > 0) {
        if (
          video.parents(".t121").length > 0 ||
          video.parents(".t223").length > 0 ||
          video.parents(".t230").length > 0 ||
          video.parents(".t368").length > 0
        ) {
          t400_updateVideoLazyLoad(video);
        }
      }
      el.find(
        ".t-feed, .t-store, .t-store__product-snippet, .t117, .t121, .t132, .t223, .t226, .t228, .t229, .t230, .t268, .t279, .t341, .t346, .t347, .t349, .t351, .t353, .t384, .t385, .t386, .t396, .t400, .t404, .t409, .t410, .t412, .t418, .t422, .t425, .t428, .t433, .t456, .t477, .t478, .t480, .t486, .t498, .t504, .t506, .t509, .t511, .t517, .t518, .t519, .t520, .t531, .t532, .t533, .t538, .t539, .t544, .t545, .t552, .t554, .t570, .t577, .t592, .t598, .t599, .t601, .t604, .t605, .t609, .t615, .t616, .t650, .t659, .t670, .t675, .t686, .t688, .t694, .t698, .t700, .t726, .t728, .t730, .t734, .t738, .t740, .t744, .t754, .t760, .t762, .t764, .t774, .t776, .t778, .t780, .t786, .t798, .t799, .t801, .t813, .t814, .t822, .t826, .t827, .t829, .t842, .t843, .t849, .t850, .t851, .t856, .t858, .t859, .t860, .t881, .t902, .t912, .t923, .t937, .t958, .t959, .t979, .t982, .t983, .t989, .t994"
      ).trigger("displayChanged");
    });
    if (typeof hideBackText != "undefined" && hideBackText.length > 0) {
      btn.addClass("t400__submit_hide-back");
      if (btn.hasClass("t400__submit-overflowed")) {
        btn.html('<span class="t400__text">' + hideBackText + "</span>");
      } else {
        btn.html(hideBackText);
      }
    } else {
      el.addClass("t400__off").hide();
    }
    if (
      window.lazy === "y" ||
      $("#allrecords").attr("data-tilda-lazy") === "yes"
    ) {
      t_onFuncLoad("t_lazyload_update", function () {
        t_lazyload_update();
      });
    }
  });
  t400_alltabs_updateContent(recid);
  t400_checkSize(recid);
  el.find(".t400").bind("displayChanged", function () {
    t400_checkSize(recid);
  });
}
function t400_alltabs_updateContent(recid) {
  var el = $("#rec" + recid);
  el.find(".t400__submit").each(function (i) {
    var recids = $(this).attr("data-hidden-rec-ids").split(",");
    recids.forEach(function (recid) {
      var el = $("#rec" + recid);
      el.attr("data-animationappear", "off");
      el.attr("data-connect-with-tab", "yes");
      el.addClass("t400__off");
    });
  });
}
function t400_checkSize(recid) {
  var el = $("#rec" + recid).find(".t400__submit");
  if (el.length) {
    var btnheight = el.height();
    var textheight = el[0].scrollHeight;
    if (btnheight < textheight) {
      var btntext = el.text();
      el.addClass("t400__submit-overflowed");
      el.html('<span class="t400__text">' + btntext + "</span>");
    }
  }
}
function t400_updateVideoLazyLoad(video) {
  setTimeout(function () {
    video.each(function () {
      var div = $(this);
      var height = div.attr("data-videolazy-height")
        ? $(this).attr("data-videolazy-height")
        : "100%";
      if (height.indexOf("vh") != -1) {
        height = "100%";
      }
      var videoId = div.attr("data-videolazy-id").trim();
      var blockId = div.attr("data-blocklazy-id") || "";
      if (typeof div.attr("data-videolazy-two-id") != "undefined") {
        var videoTwoId = "_" + div.attr("data-videolazy-two-id") + "_";
      } else {
        var videoTwoId = "";
      }
      if (div.attr("data-videolazy-type") == "youtube") {
        div.find("iframe").remove();
        div.prepend(
          '<iframe id="youtubeiframe' +
            videoTwoId +
            blockId +
            '" width="100%" height="' +
            height +
            '" src="//www.youtube.com/embed/' +
            videoId +
            '?rel=0&fmt=18&html5=1&showinfo=0" frameborder="0" allowfullscreen></iframe>'
        );
      }
    });
  }, 300);
}
function t554__init(recid) {
  var el = $("#rec" + recid);
  var mapHeight = parseFloat(el.find(".t554_map").height());
  var cardHeight = parseFloat(el.find(".t554__card").outerHeight());
  var cardTop = parseFloat(
    (el.find(".t554__card").css("top") || "").replace("px", "")
  );
  if (
    mapHeight < cardHeight + cardTop &&
    $(window).width() > 960 &&
    el.find(".t554__general-wrapper").hasClass("t554__general-wrapper_padding")
  ) {
    var paddBottom = cardHeight + cardTop - mapHeight;
    el.find(".t554__general-wrapper").css("padding-bottom", paddBottom + "px");
  }
}
function t702_initPopup(recid) {
  $("#rec" + recid).attr("data-animationappear", "off");
  $("#rec" + recid).css("opacity", "1");
  var el = $("#rec" + recid).find(".t-popup"),
    hook = el.attr("data-tooltip-hook"),
    analitics = el.attr("data-track-popup");
  el.bind(
    "scroll",
    t_throttle(function () {
      if (
        window.lazy === "y" ||
        $("#allrecords").attr("data-tilda-lazy") === "yes"
      ) {
        t_onFuncLoad("t_lazyload_update", function () {
          t_lazyload_update();
        });
      }
    })
  );
  if (hook !== "") {
    $(".r").on("click", 'a[href="' + hook + '"]', function (e) {
      t702_showPopup(recid);
      t702_resizePopup(recid);
      e.preventDefault();
      if (
        window.lazy === "y" ||
        $("#allrecords").attr("data-tilda-lazy") === "yes"
      ) {
        t_onFuncLoad("t_lazyload_update", function () {
          t_lazyload_update();
        });
      }
      if (analitics > "") {
        var virtTitle = hook;
        if (virtTitle.substring(0, 7) == "#popup:") {
          virtTitle = virtTitle.substring(7);
        }
        Tilda.sendEventToStatistics(analitics, virtTitle);
      }
    });
  }
}
function t702_onSuccess(t702_form) {
  var t702_inputsWrapper = t702_form.find(".t-form__inputsbox");
  var t702_inputsHeight = t702_inputsWrapper.height();
  var t702_inputsOffset = t702_inputsWrapper.offset().top;
  var t702_inputsBottom = t702_inputsHeight + t702_inputsOffset;
  var t702_targetOffset = t702_form.find(".t-form__successbox").offset().top;
  if ($(window).width() > 960) {
    var t702_target = t702_targetOffset - 200;
  } else {
    var t702_target = t702_targetOffset - 100;
  }
  if (
    t702_targetOffset > $(window).scrollTop() ||
    $(document).height() - t702_inputsBottom < $(window).height() - 100
  ) {
    t702_inputsWrapper.addClass("t702__inputsbox_hidden");
    setTimeout(function () {
      if ($(window).height() > $(".t-body").height()) {
        $(".t-tildalabel").animate({ opacity: 0 }, 50);
      }
    }, 300);
  } else {
    $("html, body").animate({ scrollTop: t702_target }, 400);
    setTimeout(function () {
      t702_inputsWrapper.addClass("t702__inputsbox_hidden");
    }, 400);
  }
  var successurl = t702_form.data("success-url");
  if (successurl && successurl.length > 0) {
    setTimeout(function () {
      window.location.href = successurl;
    }, 500);
  }
}
function t702_lockScroll() {
  var body = $("body");
  if (!body.hasClass("t-body_scroll-locked")) {
    var bodyScrollTop =
      typeof window.pageYOffset !== "undefined"
        ? window.pageYOffset
        : (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop;
    body.css("top", "-" + bodyScrollTop + "px");
    body.attr("data-popup-scrolltop", bodyScrollTop);
  }
}
function t702_unlockScroll() {
  var body = $("body");
  if (body.hasClass("t-body_scroll-locked")) {
    var bodyScrollTop = $("body").attr("data-popup-scrolltop");
    body.removeClass("t-body_scroll-locked");
    body.css("top", "");
    body.removeAttr("data-popup-scrolltop");
    window.scrollTo(0, bodyScrollTop);
  }
}
function t702_showPopup(recid) {
  var rec = $("#rec" + recid);
  var popup = rec.find(".t-popup");
  popup.css("display", "block");
  var $range = rec.find(".t-range");
  $range.trigger("popupOpened");
  var range = $range.get(0);
  if (range) {
    var triggerChangeEvent;
    if (/msie|trident/.test(navigator.userAgent)) {
      triggerChangeEvent = document.createEvent("Event");
      triggerChangeEvent.initEvent("popupOpened", !0, !1);
    } else {
      triggerChangeEvent = new Event("popupOpened");
    }
    range.dispatchEvent(triggerChangeEvent);
  }
  if (
    window.lazy === "y" ||
    $("#allrecords").attr("data-tilda-lazy") === "yes"
  ) {
    t_onFuncLoad("t_lazyload_update", function () {
      t_lazyload_update();
    });
  }
  setTimeout(function () {
    popup.find(".t-popup__container").addClass("t-popup__container-animated");
    popup.addClass("t-popup_show");
  }, 50);
  $("body").addClass("t-body_popupshowed t702__body_popupshowed");
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream) {
    setTimeout(function () {
      t702_lockScroll();
    }, 500);
  }
  rec.find(".t-popup").mousedown(function (e) {
    var windowWidth = $(window).width();
    var maxScrollBarWidth = 17;
    var windowWithoutScrollBar = windowWidth - maxScrollBarWidth;
    if (e.clientX > windowWithoutScrollBar) {
      return;
    }
    if (e.target == this) {
      t702_closePopup(recid);
    }
  });
  rec.find(".t-popup__close").click(function (e) {
    t702_closePopup(recid);
  });
  rec.find('.t-submit[href*="#"]').click(function (e) {
    if ($("body").hasClass("t-body_scroll-locked")) {
      $("body").removeClass("t-body_scroll-locked");
    }
  });
  rec.find('a[href*="#"]').click(function (e) {
    var url = $(this).attr("href");
    if (!url || url.substring(0, 7) != "#price:") {
      t702_closePopup(recid);
      if (!url || url.substring(0, 7) == "#popup:") {
        setTimeout(function () {
          $("body").addClass("t-body_popupshowed");
        }, 300);
      }
    }
  });
  $(document).keydown(function (e) {
    if (e.keyCode == 27) {
      t702_closePopup(recid);
    }
  });
}
function t702_closePopup(recid) {
  $("body").removeClass("t-body_popupshowed t702__body_popupshowed");
  $("#rec" + recid + " .t-popup").removeClass("t-popup_show");
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream) {
    t702_unlockScroll();
  }
  setTimeout(function () {
    $(".t-popup").not(".t-popup_show").css("display", "none");
  }, 300);
}
function t702_resizePopup(recid) {
  var el = $("#rec" + recid),
    div = el.find(".t-popup__container").height(),
    win = $(window).height() - 120,
    popup = el.find(".t-popup__container");
  if (div > win) {
    popup.addClass("t-popup__container-static");
  } else {
    popup.removeClass("t-popup__container-static");
  }
}
function t702_sendPopupEventToStatistics(popupname) {
  var virtPage = "/tilda/popup/";
  var virtTitle = "Popup: ";
  if (popupname.substring(0, 7) == "#popup:") {
    popupname = popupname.substring(7);
  }
  virtPage += popupname;
  virtTitle += popupname;
  if (window.Tilda && typeof Tilda.sendEventToStatistics == "function") {
    Tilda.sendEventToStatistics(virtPage, virtTitle, "", 0);
  } else {
    if (ga) {
      if (window.mainTracker != "tilda") {
        ga("send", { hitType: "pageview", page: virtPage, title: virtTitle });
      }
    }
    if (window.mainMetrika > "" && window[window.mainMetrika]) {
      window[window.mainMetrika].hit(virtPage, {
        title: virtTitle,
        referer: window.location.href,
      });
    }
  }
}
function t774_init(recid) {
  t774_unifyHeights(recid);
  $(window).on(
    "resize",
    t_throttle(function () {
      t774_unifyHeights(recid);
    }, 200)
  );
  $(".t774").on("displayChanged", function () {
    t774_unifyHeights(recid);
  });
  $(window).on("load", function () {
    t774_unifyHeights(recid);
  });
  setTimeout(function () {
    t774__updateLazyLoad(recid);
  }, 500);
}
function t774__updateLazyLoad(recid) {
  var scrollContainer = $("#rec" + recid + " .t774__container_mobile-flex");
  var curMode = $(".t-records").attr("data-tilda-mode");
  if (
    scrollContainer.length &&
    curMode != "edit" &&
    curMode != "preview" &&
    window.lazy === "y"
  ) {
    scrollContainer.bind(
      "scroll",
      t_throttle(function () {
        if (
          window.lazy === "y" ||
          $("#allrecords").attr("data-tilda-lazy") === "yes"
        ) {
          t_onFuncLoad("t_lazyload_update", function () {
            t_lazyload_update();
          });
        }
      }, 500)
    );
  }
}
function t774_unifyHeights(recid) {
  var t774_el = $("#rec" + recid),
    t774_blocksPerRow = t774_el
      .find(".t774__container")
      .attr("data-blocks-per-row"),
    t774_cols = t774_el.find(".t774__content"),
    t774_mobScroll = t774_el.find(".t774__scroll-icon-wrapper").length;
  if ($(window).width() <= 480 && t774_mobScroll == 0) {
    t774_cols.css("height", "auto");
    return;
  }
  var t774_perRow = +t774_blocksPerRow;
  if ($(window).width() <= 960 && t774_mobScroll > 0) {
    var t774_perRow = t774_cols.length;
  } else {
    if ($(window).width() <= 960) {
      var t774_perRow = 2;
    }
  }
  for (var i = 0; i < t774_cols.length; i += t774_perRow) {
    var t774_maxHeight = 0,
      t774_row = t774_cols.slice(i, i + t774_perRow);
    t774_row.each(function () {
      var t774_curText = $(this).find(".t774__textwrapper"),
        t774_curBtns = $(this).find(
          ".t774__btn-wrapper, .t774__btntext-wrapper"
        ),
        t774_itemHeight =
          t774_curText.outerHeight() + t774_curBtns.outerHeight();
      if (t774_itemHeight > t774_maxHeight) {
        t774_maxHeight = t774_itemHeight;
      }
    });
    t774_row.css("height", t774_maxHeight);
  }
}
function t938_init(recid, margins) {
  var rec = $("#rec" + recid);
  t938_setImageHeight(recid, margins);
  $(window).bind(
    "resize",
    t_throttle(function () {
      t938_setImageHeight(recid, margins);
    })
  );
  rec.find(".t937").bind("displayChanged", function () {
    t938_setImageHeight(recid, margins);
  });
}
function t938_setImageHeight(recid, margins) {
  var rec = $("#rec" + recid);
  var image = rec.find(".t938__background-image");
  if ($(window).width() <= 960) {
    image.css("height", "");
    image.css("width", "");
  } else {
    image.css("height", "calc(100% + " + margins + "px)");
  }
  image.css("visibility", "");
}
function t975_init(recid) {
  var el_rec = $("#rec" + recid);
  var el_menu = el_rec.find(".t975");
  t975_findActiveItem(recid);
  el_menu.removeClass("t975__beforeready");
  t975_checkAnchorLinks(recid);
  t975_detectIphone(el_menu);
  if (el_menu.attr("data-hidemenuonscroll") || t975_detectIphone(el_menu)) {
    t975_handleScroll(el_menu);
  }
  if ($("#tildacopy").length > 0 && $(document).height() > 800) {
    t975_addCopyrightMargin(el_menu);
  }
}
function t975_addCopyrightMargin(el_menu) {
  var menuHeight = el_menu.height();
  $("#tildacopy").css("paddingBottom", menuHeight);
  t975_handleScroll(el_menu);
}
function t975_detectIphone(el_menu) {
  var isIphone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
  var aspect = window.screen.width / window.screen.height;
  var iphoneAspect = "0.462";
  if (isIphone && aspect.toFixed(3) === iphoneAspect) {
    return !0;
  }
}
function t975_findActiveItem(recid) {
  var url = window.location.href;
  var pathname = window.location.pathname;
  var hash = window.location.hash;
  if (url.substr(url.length - 1) == "/") {
    url = url.slice(0, -1);
  }
  if (pathname.substr(pathname.length - 1) == "/") {
    pathname = pathname.slice(0, -1);
  }
  if (pathname.charAt(0) == "/") {
    pathname = pathname.slice(1);
  }
  if (pathname == "") {
    pathname = "/";
  }
  $(".t975__list-item a[href='" + url + "'] ").addClass("t-active");
  $(".t975__list-item a[href='" + url + "/']").addClass("t-active");
  $(".t975__list-item a[href='" + pathname + "']").addClass("t-active");
  $(".t975__list-item a[href='/" + pathname + "']").addClass("t-active");
  $(".t975__list-item a[href='" + pathname + "/']").addClass("t-active");
  $(".t975__list-item a[href='/" + pathname + "/']").addClass("t-active");
  if (hash) {
    $(".t975__list-item a[href='" + hash + "']").addClass("t-active");
  }
}
function t975_checkAnchorLinks(recid) {
  var navLinks = $(
    "#rec" + recid + " .t975__list-item a:not(.tooltipstered)[href*='#']"
  );
  if (navLinks.length > 0) {
    t975_catchScroll(navLinks, recid);
  }
}
function t975_catchScroll(navLinks, recid) {
  var clickedSectionId = null,
    sections = new Array(),
    sectionIdTonavigationLink = [];
  var el_rec = $("#rec" + recid);
  var el_menu = el_rec.find(".t975");
  navLinks = $(navLinks.get().reverse());
  navLinks.each(function () {
    var cursection = t975_getSectionByHref($(this));
    if (typeof cursection.attr("id") != "undefined") {
      sections.push(cursection);
    }
    sectionIdTonavigationLink[cursection.attr("id")] = $(this);
  });
  t975_updateSectionsOffsets(sections);
  sections.sort(function (a, b) {
    return b.attr("data-offset-top") - a.attr("data-offset-top");
  });
  t975_highlightNavLinks(
    navLinks,
    sections,
    sectionIdTonavigationLink,
    clickedSectionId
  );
  navLinks.click(function () {
    var clickedSection = t975_getSectionByHref($(this));
    if (
      !$(this).hasClass("tooltipstered") &&
      typeof clickedSection.attr("id") != "undefined"
    ) {
      navLinks.removeClass("t-active");
      $(this).addClass("t-active");
      clickedSectionId = t975_getSectionByHref($(this)).attr("id");
    }
  });
  $(window).bind(
    "resize",
    t_throttle(function () {
      t975_updateSectionsOffsets(sections);
    })
  );
  el_menu.bind("displayChanged", function () {
    t975_updateSectionsOffsets(sections);
  });
  $(window).bind(
    "scroll",
    t_throttle(function () {
      clickedSectionId = t975_highlightNavLinks(
        navLinks,
        sections,
        sectionIdTonavigationLink,
        clickedSectionId
      );
    })
  );
}
function t975_updateSectionsOffsets(sections) {
  $(sections).each(function () {
    var curSection = $(this);
    curSection.attr("data-offset-top", curSection.offset().top);
  });
}
function t975_getSectionByHref(curlink) {
  var curLinkValue = curlink
    .attr("href")
    .replace(/\s+/g, "")
    .replace(/.*#/, "");
  if (curlink.is('[href*="#rec"]')) {
    return $(".r[id='" + curLinkValue + "']");
  } else {
    return $(".r[data-record-type='215']").has(
      "a[name='" + curLinkValue + "']"
    );
  }
}
function t975_highlightNavLinks(
  navLinks,
  sections,
  sectionIdTonavigationLink,
  clickedSectionId
) {
  var scrollPosition = $(window).scrollTop(),
    valueToReturn = clickedSectionId;
  if (
    sections.length != 0 &&
    clickedSectionId == null &&
    sections[sections.length - 1].attr("data-offset-top") > scrollPosition + 300
  ) {
    navLinks.removeClass("t-active");
    return null;
  }
  $(sections).each(function (e) {
    var curSection = $(this),
      sectionTop = curSection.attr("data-offset-top"),
      sectionId = curSection.attr("id"),
      navLink = sectionIdTonavigationLink[sectionId];
    if (
      scrollPosition + 300 >= sectionTop ||
      (sections[0].attr("id") == sectionId &&
        scrollPosition >= $(document).height() - $(window).height())
    ) {
      if (clickedSectionId == null && !navLink.hasClass("t-active")) {
        navLinks.removeClass("t-active");
        navLink.addClass("t-active");
        valueToReturn = null;
      } else {
        if (clickedSectionId !== null && sectionId == clickedSectionId) {
          valueToReturn = null;
        }
      }
      return !1;
    }
  });
  return valueToReturn;
}
function t975_handleScroll(el_menu) {
  var isScrolling;
  var lastScrollTop = 0;
  var delta = 5;
  var initialHeight = window.innerHeight;
  var maxHeight = initialHeight;
  var menuPadding;
  $(window).bind(
    "scroll",
    t_throttle(function () {
      var currentScrollTop = $(this).scrollTop();
      if (Math.abs(lastScrollTop - currentScrollTop) <= delta) return;
      if (t975_detectIphone(el_menu)) {
        if ($("#tildacopy").length > 0 && $(document).height() > 800) {
          var menuHeight = el_menu.outerHeight();
          $("#tildacopy").css("paddingBottom", menuHeight);
        }
      }
      if (el_menu.attr("data-hidemenuonscroll")) {
        currentScrollTop > lastScrollTop
          ? el_menu.slideDown(240)
          : el_menu.slideUp();
      }
      lastScrollTop = currentScrollTop;
    })
  );
}
