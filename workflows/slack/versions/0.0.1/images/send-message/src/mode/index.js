
const SimpleMode = require('./simple');
const TemplateMode = require('./template');
const DefaultTemplateMode = require('./default-template');



class Mode {

    static send(type){
        let mode = SimpleMode;
        if(type === "template"){
            mode = TemplateMode;
        }
        else if(type === "default-template"){
            mode = DefaultTemplateMode;
        }
        mode.send();
    }

}

module.exports = Mode;
