/*!
 * jQuery Smart Truncate V 0.1.0
 *
 * Copyright 2012, Mubarak Bijinemula
 * Dual licensed under the MIT License (MIT-LICENSE) and GPL License,version 2 (GPL-LICENSE).
 *
 * jQuery plugin
 *
 */

(function($){
  $.smartTruncate = {
    defaults: {
      'trailWith': '&hellip;',
      'showMoreText': 'Show more',
      'showLessText': 'Show less',
      'linkTo' : null
    },
    fn: {
      lineHeight: function($ele) {
        var line_height = parseInt($ele.css("line-height"));
        if(isNaN(line_height)) {
          var fontSize = parseInt($ele.css("font-size"));
          line_height = parseInt(1.125 * fontSize, 10);
        }
        return line_height;
      },
      clipContainer: function($ele, height, position) {
        $ele.css({height: height, position: position});
      },
      unClipContainer: function($ele, position) {
        $ele.css({height: "auto", position: position});
      },
      removeOverflowedElements: function($ele) {
        var self = this;
        $ele.children().each(function() {
          var $this = $(this);
          if(self.isElementClipped($ele, $this)) {
            $this.addClass("st_partiallyClipped").nextAll().remove();
            return false;
          }
        });
      },
      isElementClipped: function($parent, $child) {
        return  ($parent.height() - ($child.position().top + $child.outerHeight(true))) < 0;
      },
      trimToHeight: function($ele, height) {
        var self = this;
        while($ele.outerHeight(true) > height) {
          self.shortenNode($ele.get(0));
        }
      },
      shortenNode: function(node) {
        var self = this, childNode = node.lastChild, childNodeText;
        if(typeof(childNode) === "undefined") return;

        childNodeText = self.getTextContent(childNode);
        if(childNodeText.length === 0) {
          node.removeChild(childNode);
        } else {
          node.removeChild(childNode);
          node.appendChild(document.createTextNode(childNodeText.substr(0, childNodeText.lastIndexOf(" "))));
        }
      },
      getTextContent: function(node) {
        if(typeof(node.textContent) === "undefined") {
          return node.toString();
        } else {
          return node.textContent;
        }
      }
    }
  };

  $.fn.smartTruncate = function(options) {
    return this.each(function() {
      var context = $.extend({}, $.smartTruncate.defaults, options);
      context.$container = $(this);
      // return if trimming is not required
      if(context.$container.outerHeight(true) < context.height) {
        return false;
      }

      // take copy of original HTML
      context.originalHTML = context.$container.html();

      context.position = context.$container.css("position");

      var position = context.position === "static" ? "relative" : context.position;
      $.smartTruncate.fn.clipContainer(context.$container, context.height, position);
      $.smartTruncate.fn.removeOverflowedElements(context.$container);

      context.$partiallyClipped = context.$container.find(".st_partiallyClipped");
      // check and remove if the partially clipped container is totally hidden
      if((context.$partiallyClipped.position().top + $.smartTruncate.fn.lineHeight(context.$partiallyClipped)) > context.height) {
        context.$partiallyClipped.prev().addClass("st_partiallyClipped").next().remove();
        context.$partiallyClipped = context.$container.find(".st_partiallyClipped");
      }

      // remove bottom margin
      context.$partiallyClipped.css("margin-bottom", 0);
      context.$lessText =  context.$container.append('<span class="st_lessText" />').find('.st_lessText');


      context.$lessText.append(context.$partiallyClipped.prevAll().andSelf());

      // prepend the trailing text so that it will be consider while trimming
      context.$trailingText = context.$partiallyClipped.prepend('<span class="st_trailingText">' + context.trailWith + ' <a href="javascript:void(0)" class="st_showMore">' + context.showMoreText + '</a></span>').find('.st_trailingText');

      //calculate the height of the partially show content
      var partiallyClippedVisibleHeight = context.height - context.$partiallyClipped.position().top;

      // trim the text of all the elements inside partially clipped element until it fits in available height
      $.smartTruncate.fn.trimToHeight(context.$partiallyClipped, partiallyClippedVisibleHeight);

      // now un-clip the parent container so that the text wraps gracefully on browser resize
      $.smartTruncate.fn.unClipContainer(context.$container, context.position);
      // move the trailing text to the end of the partially clipped element
      context.$partiallyClipped.append(context.$trailingText);

      if(context.linkTo) {
        context.$lessText.find("a.st_showMore").attr("href", context.linkTo);
      } else {
        context.$moreText =  context.$container.append('<span class="st_moreText" style="display: none;" />').find('.st_moreText');
        context.$moreText.html(context.originalHTML);
        context.$moreText.append('<a href="javascript:void(0)" class="st_showLess">' + context.showLessText + '</a>');

        // bind show more link
        context.$lessText.find("a.st_showMore").click(function(){
          context.$lessText.hide();
          context.$moreText.show();
        });

        // bind show less link
        context.$moreText.find("a.st_showLess").click(function(){
          context.$lessText.show();
          context.$moreText.hide();
        });
      }
    });
  };
})(jQuery);