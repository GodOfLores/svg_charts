function labelValidator(x,y){
    if(x.length != y.length){
        return false;
    }
    return true;
}

class Widget{
    constructor(height,width,parent_id,target_id){
        this.parent = document.getElementById(parent_id);
        this.widget = document.createElement('span');
        this.svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        this.svg.setAttribute('height',`${height}`);
        this.svg.setAttribute('width',`${width}`);
        this.svg.id = target_id;
        this.svg.style.backgroundColor = 'rgb(222,222,255)';
        this.svg.style.borderRadius = '25px';
        this.svg.style.boxShadow = '0px 0px 3px 1px rgba(191,191,225,0.2)';
        this.svg.style.padding = '10px';
        this.svg.style.display = 'block';
        this.parent.appendChild(this.svg); 
    }
}

class Graph{
    constructor(height, width , parent_id, target_class){
        this.height = height;
        this.width = width;
        this.target_class = target_class;
        this.axisWidth = 2;
        this.offsetY = this.height/10;
        this.offsetX = this.width/10;
        this.axisColor = 'black'
        this.parent = document.getElementById(parent_id);
        this.svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        this.xAxis = document.createElementNS('http://www.w3.org/2000/svg','line');
        this.yAxis = document.createElementNS('http://www.w3.org/2000/svg','line');
        this.svg.setAttribute('height',`${height}`);
        this.svg.setAttribute('width',`${width}`);
        this.svg.style.display = 'block';
        this.svg.style.margin = 'auto';
        this.svg.setAttribute('class',target_class);
        this.parent.appendChild(this.svg);
        this.svg.appendChild(this.xAxis);
        this.svg.appendChild(this.yAxis);
    } 

    #drawAxis(){           
        this.xAxis.style.strokeWidth = `${this.axisWidth}`;
        this.xAxis.style.stroke = this.axisColor;
        this.xAxis.style.opacity = 0.4;
        this.yAxis.style.strokeWidth = `${this.axisWidth}`;
        this.yAxis.style.stroke = this.axisColor;
        this.yAxis.style.opacity = 0.4;
        this.xAxis.setAttribute('class',this.target_class+'Axis'+' '+this.target_class+' '+'X'+this.target_class);
        this.xAxis.setAttribute('x1',`${this.offsetX}`);
        this.xAxis.setAttribute('y1',`${this.height-this.offsetY}`);
        this.xAxis.setAttribute('x2',`${this.width-this.offsetX}`);
        this.xAxis.setAttribute('y2',`${this.height-this.offsetY}`);
        this.yAxis.setAttribute('class',this.target_class+"Axis"+" "+this.target_class);
        this.yAxis.setAttribute('x1',`${this.offsetX+this.axisWidth/2}`);
        this.yAxis.setAttribute('y1',`${this.offsetY}`);
        this.yAxis.setAttribute('x2',`${this.offsetX+this.axisWidth/2}`);
        this.yAxis.setAttribute('y2',`${this.height-this.offsetY-this.axisWidth/2}`);
    }

    setAxisWidth(width){
        this.axisWidth = width;
    }

    setOffsetX(offset){
        this.offsetX = offset;
    }

    setOffsetY(offset){
        this.offsetY = offset;
    }

    setAxisColor(color_string){
        this.axisColor = color_string;
    }

    render(){
        this.#drawAxis();
    }
}

class LabeledChart extends Graph{
    #label_opacity = 0.4;
    #label_color = 'black';
    constructor(height, width , div_id, target_class,y,x){
        super(height, width , div_id, target_class);
        this.x = x;
        this.y = y;
    }

    drawYLabels(){
        const spacer = this.offsetX/5;
        const font_size = this.offsetX/5;
        const height_left = this.height - 2*this.offsetY;
        const max_height = this.height-2*this.offsetY-this.axisWidth;
        const y_scale =  max_height/Math.max.apply(null,this.y);
        const sorted_y = this.y.slice();
        sorted_y.sort((a,b)=>a-b);
        let count = 0;
        const a = sorted_y.pop();
        const b = sorted_y[0];
        for(const bar_height of [a,b]){
            const text = document.createElementNS('http://www.w3.org/2000/svg','text');
            text.setAttribute('id',`${this.target_class}Text${count}`);
            text.setAttribute('class',`${this.target_class}Text`);
            text.setAttribute('fill',this.#label_color);
            text.setAttribute('font-size',font_size);
            text.setAttribute('y',`${this.offsetY+(max_height-bar_height*y_scale)+font_size/2}`);
            text.setAttribute('x',`${0+this.offsetX-((font_size/2)*bar_height.toString().length+this.axisWidth+spacer)}`);
            text.style.fontFamily = 'Helvetica, Arial, sans-serif';
            text.style.opacity = this.#label_opacity;
            const tspan = document.createElementNS('http://www.w3.org/2000/svg','tspan');
            const title = document.createElementNS('http://www.w3.org/2000/svg','title');
            title.innerHTML = bar_height;
            tspan.innerHTML = bar_height;
            text.appendChild(tspan);
            text.appendChild(title);
            this.svg.appendChild(text);
            count += 1;
        }
    
    }

    setLabelOpacity(number_decimal){
        this.#label_opacity = number_decimal;
    }

    setLabelColor(color){
        this.#label_color = color;
    }
}

class BarChart extends LabeledChart{
    #bars = [];
    #bar_animation_time = 2;
    #color_fate_time = 0.5;
    constructor(height, width , div_id, target_class,y,x){
        super(height, width , div_id, target_class,y,x);
        this.bar_color = 'rgb(58, 171, 241)';
        this.bar_opacity = '0.3';
        this.hoverBrightness = 200;
        this.space = 10;
    }

    #onBarOver(event){
        event.srcElement.style.filter = `brightness(${this.hoverBrightness}%)`;
    }

    #onBarOut(event){
        event.srcElement.style.filter = `brightness(100%)`;
    }

    #drawBars(){
        const space_left = this.width - (this.x.length+1) * this.space - this.offsetX*2 -this.axisWidth;
        const max_height = this.height-2*this.offsetY-this.axisWidth;
        const y_scale =  max_height/Math.max.apply(null,this.y);
        const bar_width = space_left/this.x.length;
        let x_start = this.offsetX + this.axisWidth+this.space;
        let count = 0;
        for(const bar_height of this.y){
            const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
            const title = document.createElementNS('http://www.w3.org/2000/svg','title');
            title.innerHTML = bar_height;
            rect.style.transition = `filter  ${this.#color_fate_time}s ease, height ${this.#bar_animation_time}s ease,y ${this.#bar_animation_time}s ease`;
            rect.setAttribute('id',`${this.target_class}Bar${count}`);
            rect.setAttribute('class',`${this.target_class}Bar ${this.target_class} X${this.target_class}`);
            rect.setAttribute('x',`${x_start}`);
            rect.setAttribute('y',`${this.height-(this.offsetY+this.axisWidth)}`);
            rect.setAttribute('height',`${0}`);
            rect.setAttribute('width',`${bar_width}`);
            rect.addEventListener("mouseover",(event)=>this.#onBarOver(event));
            rect.addEventListener("mouseout",(event)=>this.#onBarOut(event));
            rect.style.fill = this.bar_color;
            rect.style.fillOpacity = this.bar_opacity;
            this.svg.appendChild(rect);
            rect.appendChild(title);
            this.#bars.push({rectangle:rect,displayheight:bar_height*y_scale,y_pos:this.offsetY+(max_height-bar_height*y_scale),value:bar_height});
            x_start += bar_width + this.space;
            count ++;
        }
        window.addEventListener("load",() => this.#animateBars());
    }

    #animateBars(){
        for(const bar of this.#bars){
            bar.rectangle.setAttribute('height',`${bar.displayheight}`);
            bar.rectangle.setAttribute('y',`${bar.y_pos}`);
        }

    }

    setBarSpace(number_pixel){
        this.space = number_pixel;
    }

    setBarHoverBrightness(number_percent){
        this.hoverBrightness = number_percent;
    }

    setBarColor(color_string){
        this.bar_color = color_string;
    }

    setBarAnimationTime(num_in_s){
        this.#bar_animation_time = num_in_s;
    }

    setColorFateTime(num_in_s){
        this.#color_fate_time = num_in_s;
    }

    #scale(event){
        const width = this.svg.parentElement.offsetWidth;
        const elements = document.getElementsByClassName(`X${this.target_class}`);
        if(width < this.width){
            const scale = width/this.width;
            for(let e of elements){
                e.style.transformOrigin = `${this.offsetX}px ${this.height-this.offsetY}px`;
                e.style.transform = `scaleX(${scale})`;
            }
        }else{
            for(let e of elements){
                e.style.transform = 'scaleX(1)';
            }
        }
    }

    smartScale(number_decimal){
        window.addEventListener('load',() => this.#scale());
        window.addEventListener('resize', (event) => this.#scale(event), true);
    }

    render(){
        super.render();
        super.drawYLabels();
        this.#drawBars();
    }
}


class DottedChart extends LabeledChart{
    #dots = []
    #total_animation_time = 1;
    constructor(height, width , div_id, target_class,y,x){
        super(height, width , div_id, target_class,y,x);
        this.dot_color = 'rgb(58, 171, 241)';
        this.dot_opacity = '0.3';
        this.hoverBrightness = 200;
        this.dot_radius = 10;
        this.color_fate_time = 0.5;
        this.dot_animation_time = 1;
    }

    #onDotOver(event){
        event.srcElement.style.filter = `brightness(${this.hoverBrightness}%)`;
    }

    #onDotOut(event){
        event.srcElement.style.filter = `brightness(100%)`;
    }

    #animateDots(){
        let count = 1;
        this.#dots.sort((a,b) => a[1]-b[1]);
        for(const dot of this.#dots){
            setTimeout(()=>dot[0].setAttribute('r',`${this.dot_radius}`),this.#total_animation_time/this.#dots.length*1000*count);
            count++;
        }
    }
    
    #drawDots(){
        const space_left = this.width - this.offsetX*2 -this.axisWidth-2*this.dot_radius;
        const max_height = this.height - this.offsetY*2 -this.axisWidth-2*this.dot_radius;
        const y_scale =  max_height/Math.max.apply(null,this.y);
        const x_scale =  space_left/Math.max.apply(null,this.x);
        for(let i = 0; i < this.y.length ; i++){
            const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
            const title = document.createElementNS('http://www.w3.org/2000/svg','title');
            circle.style.transition = `filter  ${this.color_fate_time}s ease, r ${this.dot_animation_time}s ease`;
            title.innerHTML = `x=${this.x[i]} y=${this.y[i]}`;
            circle.setAttribute('id',`${this.target_class}Circle${i}`);
            circle.setAttribute('class',`${this.target_class}Circle ${this.target_class}`);
            circle.setAttribute('cx',`${this.offsetX+(this.x[i]*x_scale)+this.dot_radius+this.axisWidth}`);
            circle.setAttribute('cy',`${this.offsetY+(max_height-this.y[i]*y_scale)+this.dot_radius+this.axisWidth/2}`);
            circle.setAttribute('r',`0`);
            circle.style.fill = this.dot_color;
            circle.style.fillOpacity = this.dot_opacity;
            circle.addEventListener("mouseover",(event)=>this.#onDotOver(event));
            circle.addEventListener("mouseout",(event)=>this.#onDotOut(event));
            this.svg.appendChild(circle);
            circle.appendChild(title);
            this.#dots.push([circle,this.x[i]]);
        }
        window.addEventListener('load',() => this.#animateDots());
    }

    setDotOpacity(number_decimal){
        this.dot_opacity = number_decimal;
    }

    setTotalAnimationTime(number_sec){
        this.#total_animation_time = number_sec;
    }

    setDotAnimationTime(number_sec){
        this.dot_animation_time = number_sec;
    }

    setDotColor(color){
        this.dot_color = color;
    }

    setDotRadius(number_pixel){
        this.dot_radius = number_pixel;
    }

    setDotHoverBrightness(number_percent){
        this.hoverBrightness = number_percent;
    }

    render(){
        super.render();
        super.drawYLabels();
        this.#drawDots();
    }
}

class LineChart extends LabeledChart{
    constructor(height, width , div_id, target_class,y,x){
        super(height, width , div_id, target_class,y,x);
        this.line_color = 'rgb(58, 171, 241)';
        this.line_opacity = '0.3';
        this.hoverBrightness = 200;
        this.line_radius = 10;
    }

}


let g = new BarChart(500,900,'test','test2',[100,50,20,40,80,10,5,30,70,60,50,40,30,15,12,7],[1,2,3,5,6,7,8,9,10,1,1,1,1,1,1,1]);
let g1 = new BarChart(500,900,'test2','lel',[20,10,2,5,8],[1,2,3,4,5]);
let g2 = new BarChart(500,900,'test3','lal',[10,33,11,98,80,1,5,30,70,60,50,40,30,15,12,10,9,8,7,6,67,44,55,22,4],[1,2,3,4,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
let g3 = new DottedChart(500,900,'test4','c',[95,0,10,50,25,35,45,23,27,70,5,69],[0,0,10,5,3,2,1,7,8,6,6,4])
//const w = new Widget(500,1000,'widget','undefined');
g.setBarColor('purple');
g.smartScale();
//g.setAxisWidth(5)
g.setBarAnimationTime(1);
g.setBarHoverBrightness(300);
g.setBarAnimationTime(1.5);
g2.setBarColor('green');
g2.smartScale();
g1.smartScale();
//g3.setColorFateTime(2)
//g3.setBarAnimationTime(5)
//g3.setAxisWidth(3)
//g3.setBarHoverBrightness(150)
//g3.setBarColor('orange')
//g3.setAxisColor('gray')
//g3.setBarSpace(4)
g3.setDotColor('rgb(255,0,0)')
g3.setDotHoverBrightness(50);
g3.setDotOpacity(0.6)
//g3.setAxisWidth(5)
g3.render();
g.render();
g1.render();
g2.render();