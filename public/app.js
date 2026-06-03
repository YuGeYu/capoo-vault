import { bindInteractionGuards } from './js/interaction-guards.js';
import { boot } from './js/app-actions.js';
import { toast } from './js/app-support.js';

bindInteractionGuards();

boot().catch(error => {
  console.error(error);
  toast(error.message || '???????', 'error');
});
