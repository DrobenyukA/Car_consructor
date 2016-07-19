if (typeof(HtmlCc) === "undefined") {
    var HtmlCc = {};
}

// presentation layer of htmlcc
if (typeof(HtmlCc.Gui) === "undefined") {
    HtmlCc.Gui = {};
}

// presentation layer of web specific version of htmlcc
if (typeof(HtmlCc.Gui.Web) === "undefined") {
    HtmlCc.Gui.Web = {};
}

HtmlCc.Gui.Web.VideoHelper = function (_options) {

    if (typeof (_options.mediaUrl) === "undefined") {
        throw new Error("Parameter mediaUrl was not specified in options.");
    }

    var defaults = {};
    var options = $.extend({}, defaults, _options);

    this.options = options;

    var OEmbedProvider = function (name, urlschemesarray, apiendpoint) {
        this.name = name;
        this.urlSchemes = urlschemesarray;
        this.apiEndpoint = apiendpoint;
    };

    var providers = [
        new OEmbedProvider("youtube", ["youtube\\.com/watch.+v=[\\w-]+&?", "youtu\\.be/[\\w-]+", "youtube.com/embed"], "https://www.youtube.com/iframe_api"),
        new OEmbedProvider("wistia", [/https?:\/\/(.+)?(wistia.com|wi.st)\/.*/], '//fast.wistia.com/oembed'),
        new OEmbedProvider("vimeo", ["www\.vimeo\.com\/groups\/.*\/videos\/.*", "www\.vimeo\.com\/.*", "vimeo\.com\/groups\/.*\/videos\/.*", "vimeo\.com\/.*"], "//vimeo.com/api/oembed.json")
    ];

    var getProviderFromUrl = function (url) {
        for (var i = 0; i < providers.length; i++) {
            var provider = providers[i];
            for (var j = 0; j < provider.urlSchemes.length; j++) {
                var scheme = provider.urlSchemes[j];
                if (url.match(scheme))
                    return provider;
            }
        }
        return null;
    };

    var getYoutubeVideoIdFromVideoUrl = function (videoUrl) {
        if (!videoUrl)
            return null;
        var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = videoUrl.match(regex);
        if (match && match[2].length > 0) {
            return match[2];
        } else {
            return null;
        }
    };

    var getYoutubeHtml = function (url) {
        var html = '<iframe id="youtubePlayer" src="' + url;
        html = html + '&enablejsapi=1&playerapiid=normalplayer';
        if (options.autoplay) {
            html = html + '&autoplay=1"';
        } else {
            html = html + '"';
        }
        if (options.width) {
            html = html + ' width="' + options.width + '"';
        }
        if (options.height) {
            html = html + ' height="' + options.height + '"';
        }
        html = html + ' allowfullscreen>' + '</iframe>';

        return html;
    };

    var getVimeoHtml = function (id) {
        var html = '<iframe src="//player.vimeo.com/video/' + id;
        if (options.autoplay) {
            html = html + '?autoplay=1"';
        } else {
            html = html + '"';
        }
        if (options.width) {
            html = html + ' width="' + options.width + '"';
        }
        if (options.height) {
            html = html + ' height="' + options.height + '"';
        }

        html = html + 'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        return html;
    };

    var getWistiaHtml = function (id) {
        var html = '<iframe src="http://fast.wistia.net/embed/iframe/' + id;
        if (options.autoplay) {
            html = html + '?autoplay=1"';
        } else {
            html = html + '"';
        }
        if (options.width) {
            html = html + ' width="' + options.width + '"';
        }
        if (options.height) {
            html = html + ' height="' + options.height + '"';
        }

        html = html + 'allowtransparency="true" scrolling="no" class="wistia_embed" frameborder="0" name="wistia_embed"></iframe>';
        return html;
    };

    this.provider = getProviderFromUrl(options.mediaUrl);
    var groups;
    switch (this.provider.name) {
        case "youtube":
            var youtubeUrl = this.options.mediaUrl.replace(/.*(?:v\=|be\/|embed\/)([\w\-]+)&?.*/, "http://www.youtube.com/embed/$1?wmode=transparent");
            this.videoId = getYoutubeVideoIdFromVideoUrl(youtubeUrl);
            this.html = getYoutubeHtml(youtubeUrl);

            // This code loads the IFrame Player API code asynchronously.
            if (!window['YT'] && !window.loadingYoutubeIFrameApi) {
               window.loadingYoutubeIFrameApi = true;
               var apiScriptTag = document.createElement('script');
               apiScriptTag.src = this.provider.apiEndpoint;
               var firstScriptTag = document.getElementsByTagName('script')[0];
               firstScriptTag.parentNode.insertBefore(apiScriptTag, firstScriptTag);
            }

            break;
        case "wistia":
            groups = this.options.mediaUrl.match(/https?:\/\/(.+)?(wistia\.com|wi\.st)\/(.*?)\/(.+?)\?.*/i);
            this.videoId = (typeof (groups) !== "undefined" && groups !== null && groups.length > 2) ? groups[groups.length - 1] : null;
            this.html = getWistiaHtml(this.videoId);
            break;
        case "vimeo":
            groups = this.options.mediaUrl.match(/(http:\/\/www\.vimeo\.com\/groups\/.*\/videos\/|www\.vimeo\.com\/|vimeo\.com\/groups\/.*\/videos\/|vimeo\.com\/|vimeo\.com\/m\/#.*\/|player\.vimeo\.com\/|https:\/\/www\.vimeo\.com\/|vimeo\.com\/|player\.vimeo\.com\/)(\d+)/i);
            this.videoId = (typeof (groups) !== "undefined" && groups !== null && groups.length > 2) ? groups[2] : null;
            this.html = getVimeoHtml(this.videoId);
            break;
        default:
            break;
    }
};

(function (prototype) {

    var insertYoutubeThumbnailToContainer = function ($container, id) {
        $container.append("<img src='http://img.youtube.com/vi/" + id + "/hqdefault.jpg' />");
    };

    var insertVimeoThumbnailToContainer = function ($container, id) {
        $.ajax({
            url: "http://vimeo.com/api/v2/video/" + id + ".json'",
            cache: false,
            jsonp: 'callback',
            dataType: "jsonp",
            success: function (data) {
                var thumbnail_src = data[0].thumbnail_medium;
                $container.append("<img src='" + thumbnail_src + "' style='position:relative; max-width: 190px; top:-35px'/>");
            },
            error: function (request, status, error) {
                
            }
        });
        /*

        $.getJSON('//vimeo.com/api/v2/video/' + id + '.json',
            function (json) {
               
            });*/
    };

    var insertWistiaThumbnailToContainer = function ($container, id, mediaUrl) {
        $.getJSON(this.provider.apiEndpoint + "?" + mediaUrl, function (json) {
            $container.append("<img src= '" + json.thumbnail_url + "' />");
        });
    };

    // implementation of public methods
    var insertThumbnailToContainer = function ($container) {
        switch (this.provider.name) {
            case "youtube":
                if (typeof (this.videoId) !== "undefined" && this.videoId !== null) {
                    insertYoutubeThumbnailToContainer($container, this.videoId);
                }
                break;
            case "wistia":
                if (typeof (this.videoId) !== "undefined" && this.videoId !== null)
                    insertWistiaThumbnailToContainer($container, this.videoId, this.options.mediaUrl);
                break;
            case "vimeo":
                if (typeof (this.videoId) !== "undefined" && this.videoId !== null)
                    insertVimeoThumbnailToContainer($container, this.videoId);
                break;
            default:
                break;
        }
    };

    var insertVideoToContainer = function ($container) {

       $container.html(this.html);

       if ((this.provider.name == "youtube") && this.options.autodestroy && (window['YT'])) {
          this.player = new YT.Player('youtubePlayer', {
             events: {
                'onStateChange': function (event) { 
                   var changeCode = event.data;

                   if (YT.PlayerState.ENDED == changeCode)
                   {
                      var playerIframe = event.target.getIframe();
                      var $dialog = $(playerIframe).closest('.dialog.video-dialog');
                      event.target.destroy();
                      $dialog.remove();
                   }
                }
             }
          });
       }
    };

    // exposing public methods via VideoHelper's prototype
    prototype.insertVideoToContainer = insertVideoToContainer;
    prototype.insertThumbnailToContainer = insertThumbnailToContainer;

    return prototype;

})(HtmlCc.Gui.Web.VideoHelper.prototype);
