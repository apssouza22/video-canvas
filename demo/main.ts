import '../src/index.css';
import { mountApp } from './app';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

mountApp(root);
