window.onload = init

const googleApiKey = "AIzaSyAG1FPkDpKn_pC2Kr9-hgNzodkHb9hyY8E"

function init() {
    let stateSelection = document.getElementById("state")
    for (let stateAbbr in stateMapping) {
        let option = new Option(stateMapping[stateAbbr], stateAbbr)
        stateSelection.appendChild(option)
    }
}

function submitAddress() {
    let autoDetection = document.getElementById("auto-detect").checked
    if (autoDetection) {

    } else {
        let addressForm = document.getElementById("address-form")
        if (addressForm.reportValidity()) {
            let formData = new FormData(document.getElementById("address-form"))
            let addressArray = []
            for (let entry of formData.entries()) {
                addressArray.push(entry[1].replaceAll(" ", "+"))
            }
            let addressStr = addressArray.join()
            console.log(addressStr)
            let xhrGeocoding = new XMLHttpRequest()
            xhrGeocoding.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?address="
                + addressStr + "&key=" + googleApiKey)
            xhrGeocoding.onload = (event) => {
                let responseJson = JSON.parse(event.target.response)
                let location = responseJson.results[0].geometry.location
                // let xhrTomorrow = new XMLHttpRequest();
                // xhrTomorrow.open("GET", "/weather?" + searchParam.toString());
                // xhrTomorrow.onload = (event) => showDetail(event.target.response,)
                // xhrTomorrow.send();
            }
            xhrGeocoding.send()
        } else {
            console.log("false")
        }
    }
}

function showDetail(response, address) {
    console.log()
}

const stateMapping = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
};