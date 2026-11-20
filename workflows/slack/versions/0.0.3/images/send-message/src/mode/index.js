import SimpleMode from './simple.js';
import TemplateMode from './template.js';
import DefaultTemplateMode from './default-template.js';

class Mode {
  static send(type) {
    let mode = SimpleMode;
    if (type === 'template') {
      mode = TemplateMode;
    } else if (type === 'default-template') {
      mode = DefaultTemplateMode;
    }
    mode.send();
  }
}

export default Mode;
