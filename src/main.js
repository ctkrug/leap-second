import './style.css';
import { render } from './render.js';

const root = document.getElementById('app');

render(root);
setInterval(() => render(root), 1000);
