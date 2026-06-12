import { VideoCanvas } from './domains/canvas';
import { createCanvasElement } from './domains/canvas/elementFactory';

const demoElements = [
  createCanvasElement({ type: 'video', zIndex: 0 }),
  createCanvasElement({ type: 'text', zIndex: 1 }),
];

demoElements[0].x = 180;
demoElements[0].y = 120;
demoElements[0].width = 520;
demoElements[0].height = 300;

demoElements[1].x = 760;
demoElements[1].y = 480;
demoElements[1].width = 420;
demoElements[1].height = 100;
if (demoElements[1].type === 'text') {
  demoElements[1].content = 'Drag, resize, and rotate me';
}

function App() {
  return <VideoCanvas initialState={{ elements: demoElements, selectedId: demoElements[1].id }} />;
}

export default App;
