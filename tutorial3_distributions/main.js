/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.80,
  height = window.innerHeight * 0.85,
  margin = { top: 20, bottom: 60, left: 60, right: 60 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedParty: "All"
};

/* LOAD DATA */
d3.csv("../data/chd.csv", d3.autoType).then(raw_data => {
  console.log("data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  console.log('State:', state)
  //SCALES
    xScale = d3.scaleLinear()
      .domain(d3.extent(state.data, d => d.bmi))
      .range([margin.left, width - margin.right]) 

    yScale = d3.scaleLinear()
      .domain(d3.extent(state.data, d => d.heartrate))
      .range([height - margin.bottom, margin.top]) //our min value is at the bottom, max value is at the top of our svg 

  //AXES
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

  //Creating SVG
    svg = d3.select("#d3-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)

  //Adding Axes
    svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(${0}, ${height - margin.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("class", 'axis-title')
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .text("Body Mass Index")

    svg.append("g")
      .attr("class", "yAxis")
      .attr("transform", `translate(${margin.left}, ${0})`)
      .call(yAxis)
      .append("text")
      .attr("class", 'axis-title')
      .attr("x", -50)
      .attr("y", height / 2)
      .attr("writing-mode", "vertical-lr")
      .attr("text-anchor", "middle")
      .text("Heart Rate (Beats Per Minute)")

    //SETUP  UI ELEMENTS
    const dropdown = d3.select("#dropdown") 
      
    dropdown.selectAll("options")
      .data([
        { key: "All", label: "All"},
        { key: "male", label: "Male"},
        { key: "female", label: "Female"}])
      .join("option")
      .attr("value", d => d.key)
      .text(d => d.label)
    
    dropdown.on("change", event => {
      console.log("DROP DOWN IS CHANGED", event.target.value) 
      state.selectedParty = event.target.value
      console.log("NEW STATE", state)
      draw();
    })

      draw();

}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {

  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
  .filter(d => {
    if (state.selectedParty === "All") return true 
    else return d.gender === state.selectedParty
  })

  svg.selectAll("circle")
    .data(filteredData, d => d.patientnum) //arbitrary ID# to make each data point unique   
    .join(
        enter => enter.append("circle")
          .attr("r", radius)
          .attr("fill", d => {
          if (d.gender === "male") return "#5582f9"
          else return "#fa55ed"
          })
          .style("stroke-opacity", .30)
          .style("stroke", "black")
          .attr("cy", margin.top)
          .attr("cx", d => xScale(d.bmi))
          .call(enter => enter
            .transition()
            .delay(500)
            .duration(1200)
            .attr("cy", d => yScale(d.heartrate))
            .ease(d3.easeBounce)
          ),

        update => update
            .call(sel => sel
              .transition()
              .duration(250)
              .attr("r", radius * 1.5)
              .transition()
              .duration(250)
              .attr("r", radius)
           ),
           
        exit => exit
          .attr("cy", d => yScale(d.heartrate))
          .attr("cx", d => xScale(d.bmi))
            .call(exit => exit
              .transition()
              .ease(d3.easeExpOut)
              .style("opacity", .25)
              .duration(500)
              .attr("cx", width - margin.right)
              .attr("cy", height / 2)
              .remove()
          )
      );
}