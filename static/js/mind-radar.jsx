/** @jsx React.DOM */
const MR = {}
const SH = 600;
const SW = 600;

MR.fun = {}

window.performance = window.performance || {};
performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime(); };
})();


MR.Radar = function(obj){
  this.name = obj.name;
  this._weight = obj.weight;
  this.children = [];
  this.childOffsetWeight = (obj.children&&obj.children.length)?0:1;

  this.startAg = 0;
  this.endAg = Math.PI * 2;
  this.weight = 0;
  this.numOfChild = 0;

  this.transformState = {};

  this.updateTag = false;
  for(var i in obj.children){
    this.children.push(new MR.Radar(obj.children[i]));
    this.numOfChild += this.children[i].numOfChild+1;
  }
  
  this.transformTo('weight', MR.Radar.countWeightWithChildNum(this._weight, this.numOfChild), 1000);
  // if(obj instanceof MR.radar){
  //     this.
  // }
}

// static var
MR.Radar.CHILDFIX = 0.1;

MR.Radar.tan3 = function(y, x){
  // Turn the range of tan2 from [-PI,PI] to [0, 2*PI]
  ag =  Math.atan2(y, x);
  return ag<0?(ag+2*Math.PI):ag;
}

MR.Radar.inRange = function(a, v, b){
  // Check if v is in [a, b]
  var tmp;
  if(a>b)tmp=a,a=b,b=tmp;
  return a<=v&&v<=b;
}

MR.Radar.countWeightWithChildNum = function(_weight, numOfChild){
  return _weight*(1+numOfChild*0.1);
}

MR.Radar.prototype.getWeight = function(){
  return this.weight;
}

MR.Radar.prototype.appendChild = function(child){
  console.log('append Child');
  if(this.children.length === 0){
    this.transformTo('childOffsetWeight', 0, 1000);
  }
  this.children.push(child);
  this.updateTag = true;
}

MR.Radar.prototype.transformTo = function(name, value, ms){
  if(typeof(name) == 'undefined' || typeof(value) != 'number')return false;
  if(typeof(ms) == 'undefined')ms = 1;
  if(name in this.transformState){
    this[name] = this.transformState[name].end;
  }
  this.transformState[name] = {
    stamp: window.performance.now(),
    unit: (value - this[name])/ms,
    end: value
  }
}

MR.Radar.prototype.drawName = function(ctx, x, y, r, offsetR, isHover){
  // Calculate the width of this component, and draw the name of this component.
  // Calculate the width.
  var fullR = offsetR+r, midR = offsetR+r/2, midAg = (this.startAg+this.endAg)/2,
      X = [], textY = midR*Math.sin(midAg), tmp;
  // big circle
  tmp = Math.sqrt(fullR*fullR-textY*textY);
  if(MR.Radar.inRange(this.startAg, MR.Radar.tan3(textY, tmp), this.endAg))X.push(tmp);
  if(MR.Radar.inRange(this.startAg, MR.Radar.tan3(textY, -tmp), this.endAg))X.push(-tmp);
  //small circle
  if(offsetR*offsetR-textY*textY>=0){
    tmp = Math.sqrt(offsetR*offsetR-textY*textY);
    if(MR.Radar.inRange(this.startAg, MR.Radar.tan3(textY, tmp), this.endAg))X.push(tmp);
    if(tmp!==0&&MR.Radar.inRange(this.startAg, MR.Radar.tan3(textY, -tmp), this.endAg))X.push(-tmp);
  }
  // startAg line and endAg line
  if(Math.sin(this.startAg)*textY>0){
    tmp = textY/Math.tan(this.startAg);
    if(MR.Radar.inRange(offsetR, Math.sqrt(tmp*tmp+textY*textY), fullR))X.push(tmp);
  }
  if(Math.sin(this.endAg)*textY>0){
    tmp = textY/Math.tan(this.endAg);
    if(MR.Radar.inRange(offsetR, Math.sqrt(tmp*tmp+textY*textY), fullR))X.push(tmp);
  }

  // Find left and right dot
  var l,r;
  if(X.length>2){
    var mi = 0, midx = midR*Math.cos(midAg);
    for(var i in X){
      if(Math.abs(X[i]-midx)<Math.abs(X[mi]-midx))mi=i;
    }
    l = X[mi];
    X.splice(mi,1);
    mi = 0;
    for(var i in X){
      if(Math.abs(X[i]-midx)<Math.abs(X[mi]-midx))mi=i;
    }
    r = X[mi];
  }else{
    l = X[0], r = X[1];
  }
  
  // Draw the name.
  ctx.font = 'bold 16px Arial,微軟正黑體';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'hsl('+((this.startAg+this.endAg)*90/Math.PI+180)+', 80%, '+(isHover?20:50)+'%)';
  var pstr = this.name, len = this.name.length, textWidth = Math.abs(l-r);
  while(len>=0&&ctx.measureText(pstr).width>textWidth){
    len -= 1;
    pstr = this.name.substring(0,len)+'...';
  }
  ctx.fillText(pstr, x+(l+r)/2, y+textY, textWidth);
}

MR.Radar.prototype.renderComponent = function(ctx, x, y, r, offsetR, isHover){
  var fullR = r + offsetR;
  ctx.beginPath();
  if(offsetR === 0){
    ctx.arc(x, y, r, 0, Math.PI*2,false);
  }else{
    ctx.moveTo(x+offsetR*Math.cos(this.startAg), y+offsetR*Math.sin(this.startAg));
    ctx.lineTo(x+fullR*Math.cos(this.startAg), y+fullR*Math.sin(this.startAg));
    ctx.arc(x, y, fullR, this.startAg, this.endAg, false);
    ctx.lineTo(x+offsetR*Math.cos(this.endAg), y+offsetR*Math.sin(this.endAg));
    ctx.arc(x, y, offsetR, this.endAg, this.startAg, true);
  }
  ctx.fillStyle = 'hsl('+((this.startAg+this.endAg)*90/Math.PI)+', 80%, '+(isHover?90:50)+'%)';
  ctx.fill();
  // ctx.strokeStyle = 'hsl('+((this.startAg+this.endAg)*180/Math.PI)+', 100%, 25%)';
  ctx.stroke();

  // Text - Name
  this.drawName(ctx, x, y, r, offsetR, isHover);
}

MR.Radar.prototype.renderChildren = function(ctx, x, y, r, offsetR, mouseHovorRadar){
  // Setting children's startAg and endAg
  var sumWeight = this.childOffsetWeight;
  for(var i in this.children){
    sumWeight += this.children[i].getWeight();
  }
  var unitAg = (this.endAg - this.startAg) / sumWeight;
  var startAg = this.startAg;
  for(var i in this.children){
    this.children[i].startAg = startAg;
    if(i===this.children.length-1 && this.childOffsetWeight===0){
      this.children[i].endAg = this.endAg;
    }else{
      startAg += unitAg*this.children[i].getWeight();
      this.children[i].endAg = startAg;
    }
    this.children[i].render(ctx, x, y, r, offsetR+r, mouseHovorRadar);
  }
}

MR.Radar.prototype.render = function(ctx, x, y, r, offsetR, mouseHovorRadar){
  this.renderComponent(ctx, x, y, r, offsetR, mouseHovorRadar===this);
  this.renderChildren(ctx, x, y, r, offsetR, mouseHovorRadar);
}

MR.Radar.prototype.updateComponent = function(){
  if(this.updateTag){
    this.numOfChild = this.children.length;
    for(var i in this.children){
      this.numOfChild += this.children[i].numOfChild;
    }
    this.transformTo('weight', MR.Radar.countWeightWithChildNum(this._weight, this.numOfChild), 1000);
    this.updateTag = false;
  }
  
  // Update transformState
  for(var v in this.transformState){
    var times = window.performance.now()-this.transformState[v].stamp;
    this[v] += this.transformState[v].unit*times;
    if(this.transformState[v].unit>0&&this[v]>=this.transformState[v].end||
      this.transformState[v].unit<0&&this[v]<=this.transformState[v].end){
      this[v] = this.transformState[v].end;
      delete this.transformState[v];
    }
  }
}

MR.Radar.prototype.updateChildren = function(){
  var tag = false;
  for(var i in this.children){
    tag |= this.children[i].update();
  }
  return tag;
}

MR.Radar.prototype.update = function(){
  var tag = this.updateTag;
  if(this.updateChildren()){
    tag = this.updateTag = true;
  }
  this.updateComponent();
  return tag;
}



MR.RadarPage = React.createClass({
  getInitialState: function(){
    var radar = new MR.Radar({
      name: '心智雷達',
      weight: 1,
    });
    _sam_radar = radar;
    return {
      radar: radar,
      selectRadar: radar
    };
  },
  handleSelect: function(radar){
    this.setState({selectRadar: radar});
  },
  // componentDidMount: function(){
  //   ;
  // },
  render: function(){
    return (
      <table>
        <tr>
          <td>
            <MR.RadarCanvasBox ref='radar_box' height={SH} width={SW} radar={this.state.radar} onSelect={this.handleSelect}/>
          </td>
          <td>
            <MR.RadarInfoBox radar={this.state.selectRadar}/>
          </td>
        </tr>
      </table>
    );
  }
});


MR.RadarCanvasBox = React.createClass({
  getInitialState: function(){
    return {
      fps: 0,
      r: 50,
      mouseR: 0,
      mouseAg: 0,
      mouseHovorRadar: null
    };
  },
  ctxRender: function(ctx){
    var that = this, tep1 = performance.now(), tep2, fps = 0, _render = function(){
      // fps
      fps += 1;
      tep2 = performance.now();
      if(tep2-tep1 >= 1000){
        that.setState({fps:fps});
        fps = 0;
        tep1 = tep2;
      }
      // Render Radar
      that.props.radar.update();
      ctx.clearRect(0, 0, that.props.width, that.props.height);
      that.props.radar.render(ctx, that.props.width/2, that.props.height/2, that.state.r, 0, that.state.mouseHovorRadar);

      // Drow mouse line
      that.drowMouseLine(ctx, that.props.width/2, that.props.height/2, that.state.mouseR, that.state.mouseAg);

      // Animate Loop
      window.requestAnimationFrame(_render);
    };
    _render();
  },
  drowMouseLine: function(ctx, x, y, r, ag){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+r*Math.cos(ag), y+r*Math.sin(ag));
    ctx.stroke();
  },
  handleMouseMove: function(e){
    var offset = React.findDOMNode(this.refs.canvas).getBoundingClientRect(),
        x = e.clientX - offset.left,
        y = e.clientY - offset.top,
        midx = this.props.width/2,
        midy = this.props.height/2,
        mouseR = Math.sqrt((x-midx)*(x-midx)+(y-midy)*(y-midy)),
        mouseAg = MR.Radar.tan3((y-midy), (x-midx));
        that = this,
        _chekc = function(radar, offsetR){
          var r = offsetR + that.state.r;
          if(mouseR>=offsetR&&mouseR<=r&&radar.startAg<=mouseAg&&mouseAg<=radar.endAg){
            if(that.state.mouseHovorRadar !== radar){
              that.setState({mouseHovorRadar: radar});
            }
            return true;
          }else{
            for(var i in radar.children){
              if(_chekc(radar.children[i], r))return true;
            }
          }
          return false;
        };
    this.setState({mouseR: mouseR, mouseAg:mouseAg});
    if(!_chekc(this.props.radar,0))this.setState({mouseHovorRadar: null});
  },
  handleClick: function(e){
    if(this.state.mouseHovorRadar){
      this.props.onSelect(this.state.mouseHovorRadar);
    }
  },
  handleScaling: function(v){
    var that = this;
    return function(e){
      var r = that.state.r;
      if(v&&r<300)r*=1.5;
      else if(!v&&r>10)r/=1.5;
      that.setState({r: r});
    };
  },
  componentDidMount: function(){
    var canvas = React.findDOMNode(this.refs.canvas);
    canvas.width  = this.props.width;
    canvas.height = this.props.height;
    var ctx = canvas.getContext('2d');
    this.ctxRender(ctx);
  },
  render: function(){
    return (
      <div>
        <div>fps: {this.state.fps}/s</div>
        <div>
          <button onClick={this.handleScaling(0)}>縮小</button>
          <button onClick={this.handleScaling(1)}>放大</button>
        </div>
        <canvas ref='canvas' onMouseMove={this.handleMouseMove} onClick={this.handleClick}></canvas>
      </div>
    );
  }
});


MR.RadarInfoBox = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function(){
    return {
      childName: '',
    };
  },
  handleSubmit: function(e){
    e.preventDefault();
    e.stopPropagation();
    this.props.radar.appendChild(new MR.Radar({
      name: this.state.childName,
      weight: 1,
    }));
  },
  render: function(){
    return (
      <div>
        <h2>{this.props.radar.name}</h2>
        <form onSubmit={this.handleSubmit}>
          <div>方塊名稱：</div>
          <input valueLink={this.linkState('childName')}/>
          <input type='submit' value="增加新方塊" />
        </form>
      </div>
    );
  }
});