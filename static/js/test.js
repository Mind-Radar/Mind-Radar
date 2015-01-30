d3.select('body')
.append('svg')
.attr({
  'width':200,
  'height':200
});

d3.select('svg')
.append('circle')
.attr({
'cx':50,
'cy':50,
'r':30,
'fill':'#f90',
'stroke':'#c00',
'stroke-width':'5px'
});

var data = [1,2,3,4,5];

d3.select('body').selectAll('div')
  .data(data)
  .enter()
  .append('div')
  .text(function(d){
     return d;
  });