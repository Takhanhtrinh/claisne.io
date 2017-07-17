
import debounce from 'lodash/debounce';

export default function (handleResize) {
  const cb = debounce(handleResize, 500);
  window.removeEventListener('resize', cb);
  window.addEventListener('resize', cb);
}
