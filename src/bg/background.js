/**
 * Script running in background to handle messages from popup to browser to grade editor
 */

let classes = []

chrome.runtime.onMessage.addListener( 
	(req, who, res) => {
		console.log("Recieved request " + req.m + " from " + who.tab.url)

		// if(req.m === "getGradeSummary"){ 
		//   //console.log(req.data)
		//   for(let i of req.data[0].courses){
		//     chrome.storage.local.get(['IC_subdomain'], (st) => {
		//       chrome.tabs.create({
		//         url: `https://${st.IC_subdomain}.infinitecampus.org/campus/resources/portal/grades/detail/${i.sectionID}?q=${Date.now()}`
		//       })
		//     })

		//     // if(i == req.data[0].courses.at(-1)){
		//     //   chrome.tabs.create({url: "/gradeeditor/public/index.html"})
		//     // }
		//   }
		// }

		// if(req.m == "getGradeDetails"){
		//   classes.push(req.data)
		// }

		if(req.m == "getGrades"){
			chrome.storage.local.get(['IC_subdomain'], (x) => {
				fetch(`https://${x.IC_subdomain}.infinitecampus.org/campus/resources/portal/grades?q=${Date.now()}`)
				.then(data => data.json())
				.then(data => {
					for(let i of data[0].courses){
						fetch(`https://${x.IC_subdomain}.infinitecampus.org/campus/resources/portal/grades/detail/${i.sectionID}?q=${Date.now()}`)
						.then(data => data.json())
						.then(data => {
							chrome.runtime.sendMessage({m: "recieveGrades", data: data})
						})
						.catch(error => {
							chrome.runtime.sendMessage({m: "recieveGrades", data: {fetchError: error}})
						})
					}
				})
				.catch(error => {
					console.log(error)
					chrome.runtime.sendMessage({m: "recieveGrades", data: {fetchError: error}})
				})
			})

			res(0)
		}
	}
)

chrome.runtime.onInstalled.addListener((dt) => {
	if(dt.reason == "install"){
		chrome.tabs.create({url: "/welcome/index.html"})
	}
})