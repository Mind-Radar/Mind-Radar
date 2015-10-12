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
    for(var ch in obj.children){
      this.children.push(MR.Radar(ch));
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
    radar = new MR.Radar({
      name: 'JIZZ',
      weight: 1,
      children: [{
        name:'123',
        weight: 1
      },{
        name:'456',
        weight: 2
      }]
    });
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
  componentDidMount: function(){
    this.render_canvas();
  },
  render: function(){
    return (
      <table>
        <tr>
          <td>
            <MR.RadarCanvasBox ref='radar_box' height={SH} width={SW}/>
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
      r: 50
    };
  },
  render_radar: function(radar){
    var ctx = React.findDOMNode(this.refs.canvas).getContext('2d');
    var midw = this.props.width/2, midh = this.props.height/2;
    ctx.beginPath();
    ctx.moveTo(midw,midh);
    ctx.lineTo(midw+this.state.r,midh);
    ctx.arc(midw,midh,this.state.r,radar.startAg,radar.endAg,true);
    // console.log(status.r);
    // ctx.arc(SW/2,SH/2,r,0,3.14,true);
    ctx.lineTo(midw,midh);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.stroke();
  },
  componentDidMount: function(){
    var canvas = React.findDOMNode(this.refs.canvas);
    canvas.width  = this.props.width;
    canvas.height = this.props.height;
    var ctx = canvas.getContext('2d');
  },
  render: function(){
    return <canvas ref='canvas'></canvas>;
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
          <input valueLink={this.linkState('childName')}/>
          <input type='submit' />
        </form>
      </div>
    );
  }
});