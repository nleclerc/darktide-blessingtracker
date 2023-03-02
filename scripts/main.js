
console.log('Starting...')

const weaponSelector = document.querySelector('#weaponlist')
const traitList = document.querySelector('#traitList')

async function loadJson(path,property) {
	response = await fetch(path)
	let jsonData = await response.json()

	if (property)
		jsonData = jsonData[property]

	return jsonData
}

function loadData(dataArray) {
	weaponSelector.options.length = 0

	for (let item of dataArray) {
		console.debug('Processing weapon:',item)
		weaponSelector.options[weaponSelector.options.length] = new Option(item.name)
	}
}

function mapData(dataArray,map) {
	for (let item of dataArray) {
		map[item.name] = item
	}
}

function clearTraits() {
	for (let item of document.querySelectorAll('#traitList > .item'))
		item.remove()
}

function createDiv(classes,text) {
	const el = document.createElement('div')
	el.classList.add(...classes.split(' '))

	if (text)
		el.innerHTML = text

	return el
}

function createTraitValue(valueId, isDisabled) {
	const checkbox = document.createElement('input')
	checkbox.classList.add('valueCheckbox')
	checkbox.type = 'checkbox'

	if (isDisabled) {
		checkbox.disabled = true
	} else {
		checkbox.dataset.valueid = valueId
		checkbox.checked = localStorage[valueId] == 'true'

		checkbox.addEventListener('change',(event)=>{
			localStorage[valueId] = event.target.checked
		})
	}

	const container = createDiv('item value')
	container.append(checkbox)

	return container
}

function displayTraits(item, isDisabled) {
	for (let traitName of item.traits) {
		const cleanTraitName = traitName.replace(/ ?\(.*\)$/,'')
		traitList.append(createDiv('item',cleanTraitName)) // Remove weapon category from blessing name.
		traitList.append(createTraitValue(`${item.name}:${traitName}:I`,isDisabled(cleanTraitName,1)))
		traitList.append(createTraitValue(`${item.name}:${traitName}:II`,isDisabled(cleanTraitName,2)))
		traitList.append(createTraitValue(`${item.name}:${traitName}:III`,isDisabled(cleanTraitName,3)))
		traitList.append(createTraitValue(`${item.name}:${traitName}:IV`,isDisabled(cleanTraitName,4)))
	}
}

function showSelection(weaponMap,itemName,isDisabled) {
	clearTraits()
	if (weaponMap[itemName]) {
		console.debug('Showing existing selection:',itemName)
		weaponSelector.value = itemName
		displayTraits(weaponMap[itemName],isDisabled)
	}
}

(async function() {
	const meleeData = await loadJson('data/melee.json','melee')
	const rangedData = await loadJson('data/ranged.json','ranged')
	const allData = meleeData.concat([{name:'---------',traits:[]}],rangedData)

	const disabledData = await loadJson('data/disabled.json')
	function isDisabled(trait,value) {
		return disabledData[trait] && disabledData[trait].includes(value)
	}

	const weaponMap = {}
	mapData(meleeData,weaponMap)
	mapData(rangedData,weaponMap)

	console.debug('Loaded melee data:',meleeData)
	console.debug('Loaded ranged data:',rangedData)
	console.debug('Loaded all data:',allData)

	const currentSelection = document.location.hash.substring(1).replaceAll('_',' ')
	console.debug('Current selection:',currentSelection)

	document.querySelector('#meleeButton').addEventListener('click',()=> {
		loadData(meleeData)
		showSelection(weaponMap,currentSelection,isDisabled)
	})

	document.querySelector('#rangedButton').addEventListener('click',()=> {
		loadData(rangedData)
		showSelection(weaponMap,currentSelection,isDisabled)
	})

	document.querySelector('#allButton').addEventListener('click',()=> {
		loadData(allData)
		showSelection(weaponMap,currentSelection,isDisabled)
	})

	weaponSelector.addEventListener('change',(event)=> {
		console.debug('Selection change:',event.target.value,weaponMap[event.target.value])
		document.location.hash = event.target.value.replaceAll(' ','_')
		showSelection(weaponMap,event.target.value,isDisabled)
	})

	loadData(allData)
	showSelection(weaponMap,currentSelection,isDisabled)
})()
