
console.log('Starting...')

const weaponSelector = document.querySelector('#weaponlist')
const traitList = document.querySelector('#traitList')
const checkboxMap = {}

const DIMMED_CLASS = 'dimmed'

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

function getLevelString(value) {
	switch(value) {
		case 1:
			return 'I'
		case 2:
			return 'II'
		case 3:
			return 'III'
		case 4:
			return 'IV'
		default:
			throw new Error('Invalid value:',value)
	}
}

function updateTraitDimming(traitName) {
	console.debug('Updating dimming for:',traitName)
	const checkboxes = document.querySelectorAll(`input[data-trait="${traitName}"]`)

	let highestSelected = -1

	for (const box of Array.from(checkboxes).reverse()) {
		const level = parseInt(box.dataset.level,10)
		box.classList.toggle('dimmed', highestSelected > level)
		if (box.checked)
			highestSelected = Math.max(highestSelected,level)
	}
}

function createTraitValue(itemName,traitName,level, isDisabled) {
	const valueId = `${itemName}:${traitName}:${getLevelString(level)}`

	const checkbox = document.createElement('input')
	checkbox.classList.add('valueCheckbox')
	checkbox.type = 'checkbox'

	if (isDisabled) {
		checkbox.disabled = true
	} else {
		checkbox.dataset.valueid = valueId
		checkbox.dataset.trait = traitName
		checkbox.dataset.level = level
		checkbox.checked = localStorage[valueId] == 'true'

		checkbox.addEventListener('change',(event)=>{
			localStorage[valueId] = event.target.checked
			updateTraitDimming(traitName)
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
		traitList.append(createTraitValue(item.name,traitName,1,isDisabled(cleanTraitName,1)))
		traitList.append(createTraitValue(item.name,traitName,2,isDisabled(cleanTraitName,2)))
		traitList.append(createTraitValue(item.name,traitName,3,isDisabled(cleanTraitName,3)))
		traitList.append(createTraitValue(item.name,traitName,4,isDisabled(cleanTraitName,4)))
		updateTraitDimming(traitName)
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
