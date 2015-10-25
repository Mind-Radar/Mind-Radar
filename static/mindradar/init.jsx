/** @jsx React.DOM */
const MR = {}

window.performance = window.performance || {};
performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime(); };
})();


SC.App = React.createClass({
  mixins: [RMR.RouterMixin],
  routes: {
    '/': 'indexHandler',
    '/login': 'loginHandler',
    '/logout': 'logoutHandler',
  },
  ajax: function(url,method,data,callback){
    console.log('AJAX TO URL:'+url);
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    this.setState({loading:15});
    xhr.onreadystatechange = function(){
      if(xhr.readyState==4){
        console.log('AJAX END');
        if(xhr.status){
          this.setState({status:xhr.status});
        }
        setTimeout(function(){this.setState({loading:-1});}.bind(this), 1000);
        if(xhr.status==200){
          callback(JSON.parse(xhr.response));
        }
      }
    }.bind(this);
    xhr.onprogress = function(e){
      if(e.lengthComputable){
        console.log('AJAX:'+e.loaded*100 / e.total+'%');
        this.setState({loading: e.loaded*100 / e.total});
      }
    }.bind(this);
    xhr.onerror = function(){
      this.setState({status: 500});
    };
    xhr.send(data);
  },
  getInitialState: function() {
    return {
      loading: -1,
      status: 200,
      current_user: this.props.current_user
    };
  },
  componentDidMount: function(){
    // $.material.init();
  },
  componentWillUpdate: function(){
    if(this.state.url!=window.location.pathname+window.location.search){
      this.setState({url:window.location.pathname+window.location.search,status:200});
    }
  },
  setCurrentUser: function(current_user){
    this.setState({current_user:current_user});
  },
  render: function() {
    var getPage = function(){
      if(this.state.status===200){
        return this.renderCurrentRoute();
      }else{
        return <SC.ErrorPage errorCode={this.state.status} />;
      }
    }.bind(this);
    var progressBar = function(){
      if(this.state.loading>=0){
        return (
          <RB.ProgressBar now={this.state.loading} bsStyle='danger'
            style={{position:'fixed',top:'0px',height:'6px',width:'100%',zIndex:100}} />
        );
      }
    }.bind(this);
    return (
      <div>
        {progressBar()}
        <SC.NavbarInstance name={this.props.name} current_user={this.state.current_user} url={this.state.url}/>
        {getPage()}
      </div>
    );
  },

  toInt: function(s, defaultValue){
    return parseInt(s)?parseInt(s):defaultValue;
  },

  // indexHandler: function() {
  //   return <SC.RedirectPage url='/announce' />;
  // },
  // loginHandler: function(params) {
  //   params = SC.makeOtherArray(['',], params);
  //   return <SC.LoginPage ajax={this.ajax} next={params.next} setCurrentUser={this.setCurrentUser}/>;
  // },
  // logoutHandler: function() {
  //   return <SC.LogoutPage ajax={this.ajax} setCurrentUser={this.setCurrentUser}/>;
  // },


  // Else
  notFound: function(path) {
      return <SC.ErrorPage errorCode='404' />;
  },
});


SC.RedirectPage = React.createClass({
  componentDidMount: function(){
    console.log('Redirect to '+this.props.url);
    SC.Redirect(this.props.url);
  },
  render: function() {
    return (
      <div />
    );
  }
});
