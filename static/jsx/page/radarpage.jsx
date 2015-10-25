/** @jsx React.DOM */

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
