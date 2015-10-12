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
    this.weight = obj.weight;
    this.children = [];

    this.startAg = 0;
    this.endAg = Math.PI * 2;
    for(var i in obj.children){
      this.children.push(new MR.Radar(obj.children[i]));
    }
    // if(obj instanceof MR.radar){
    //     this.
    // }
    this.appendChild = function(child){
      console.log('append Child');
      this.children.push(child);
    }
}


MR.RadarPage = React.createClass({
  getInitialState: function(){
    var radar = new MR.Radar({
      name: '新智雷達',
      weight: 1,
    });
    _sam_radar = radar;
    return {
      radar: radar,
      selectRadar: radar,
      fps: 0
    };
  },
  render_canvas: function(){
    var that = this, tep1 = performance.now(), tep2, fps = 0, _render = function(){
      // fps
      fps += 1;
      tep2 = performance.now();
      if(tep2-tep1 >= 1000){
        that.setState({fps:fps});
        fps = 0;
        tep1 = tep2;
      }
      that.refs.radar_box.render_radar(that.state.radar);
      window.requestAnimationFrame(_render);
    };
    _render();
  },
  handleSelect: function(radar){
    this.setState({selectRadar: radar});
  },
  componentDidMount: function(){
    this.render_canvas();
    console.log("JIZZ");
  },
  render: function(){
    return (
      <table>
        <tr>
          <td>
            <MR.RadarCanvasBox ref='radar_box' height={SH} width={SW} radar={this.state.radar} onSelect={this.handleSelect}/>
          </td>
          <td>
            <div id="fps">fps: {this.state.fps}/s</div>
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
      r: 50,
      mouseR: 0,
      mouseAg: 0,
      mouseHovorRadar: null
    };
  },
  render_radar: function(radar, offsetR, ctx){
    if(typeof(offsetR) == 'undefined')offsetR = 0;
    var midx = this.props.width/2, midy = this.props.height/2, r = offsetR+this.state.r;
    if(typeof(ctx) == 'undefined'){
      ctx = React.findDOMNode(this.refs.canvas).getContext('2d');
      ctx.clearRect(0,0,SW,SH);
      ctx.beginPath();
      ctx.moveTo(midx,midy);
      ctx.lineTo(midx+this.state.mouseR*Math.cos(this.state.mouseAg),midy+this.state.mouseR*Math.sin(this.state.mouseAg));
      ctx.stroke();
    }
    // Drow the radar unit
    ctx.beginPath();
    ctx.moveTo(midx+offsetR*Math.cos(radar.startAg),midy+offsetR*Math.sin(radar.startAg));
    ctx.lineTo(midx+r*Math.cos(radar.startAg),midy+r*Math.sin(radar.startAg));
    ctx.arc(midx,midy,r,radar.startAg,radar.endAg,false);
    ctx.lineTo(midx+offsetR*Math.cos(radar.endAg),midy+offsetR*Math.sin(radar.endAg));
    ctx.arc(midx,midy,offsetR,radar.endAg,radar.startAg,true);
    ctx.fillStyle = 'hsl('+((radar.startAg+radar.endAg)*90/Math.PI)+', 80%, '+(radar==this.state.mouseHovorRadar?90:50)+'%)';
    ctx.fill();
    // ctx.strokeStyle = 'hsl('+((radar.startAg+radar.endAg)*180/Math.PI)+', 100%, 25%)';
    ctx.stroke();

    // Drow children
    var sumWeight = 0;
    for(var i in radar.children){
      sumWeight += radar.children[i].weight;
    }
    var unitAg = (radar.endAg - radar.startAg) / sumWeight;
    var startAg = radar.startAg;
    for(var i in radar.children){
      radar.children[i].startAg = startAg;
      if(i==radar.children.length-1){
        radar.children[i].endAg = radar.endAg;
      }else{
        startAg += unitAg*radar.children[i].weight;
        radar.children[i].endAg = startAg;
      }
      this.render_radar(radar.children[i], r, ctx);
    }
  },
  handleMouseMove: function(e){
    var offset = React.findDOMNode(this.refs.canvas).getBoundingClientRect(),
        x = e.clientX - offset.left,
        y = e.clientY - offset.top,
        midx = this.props.width/2,
        midy = this.props.height/2,
        mouseR = Math.sqrt((x-midx)*(x-midx)+(y-midy)*(y-midy)),
        _mouseAg = Math.atan((y-midy)/(x-midx))+((x-midx)<0?Math.PI:0),
        mouseAg = _mouseAg<0?(_mouseAg+2*Math.PI):_mouseAg;
        that = this,
        _chekc = function(radar, offsetR){
          var r = offsetR + that.state.r;
          if(mouseR>=offsetR&&mouseR<=r&&radar.startAg<=mouseAg&&mouseAg<=radar.endAg){
            that.setState({mouseHovorRadar: radar});
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
  componentDidMount: function(){
    var canvas = React.findDOMNode(this.refs.canvas);
    canvas.width  = this.props.width;
    canvas.height = this.props.height;
    var ctx = canvas.getContext('2d');
  },
  render: function(){
    return <canvas ref='canvas' onMouseMove={this.handleMouseMove} onClick={this.handleClick}></canvas>;
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