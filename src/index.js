import MiniMasonry from 'minimasonry'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipeDynamicCaption from 'photoswipe-dynamic-caption-plugin'
import 'photoswipe/style.css'
import 'photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css'

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
  	var context = this, args = arguments;
  	clearTimeout(timeout);
  	if (immediate && !timeout) func.apply(context, args);
  	timeout = setTimeout(function() {
  		timeout = null;
  		if (!immediate) func.apply(context, args);
  	}, wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const masonry = new MiniMasonry({
    container: '#photos',
    gutter: 10,
  })
  const debouncedMasonryLayout = debounce(function() {
    masonry.layout()
  }, 100)

  document.querySelectorAll('.photo-image').forEach((photo) => {
    photo.addEventListener('load', () => {
      debouncedMasonryLayout()
    })
  })


  const lightbox = new PhotoSwipeLightbox({
    gallery: '#photos',
    children: 'a',
    pswpModule: () => import('photoswipe'),
  })
  lightbox.init()

  const captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
    // Plugins options, for example:
    type: 'auto',
  })
})
