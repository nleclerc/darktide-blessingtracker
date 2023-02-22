
console.log('Starting...')

const weaponSelector = document.querySelector('#weaponlist')
const traitList = document.querySelector('#traitList')

async function loadJson(path,property) {
	response = await fetch(path)
	const jsonData = await response.json()
	return jsonData[property]
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

function createTraitValue(valueId) {
	const checkbox = document.createElement('input')
	checkbox.classList.add('valueCheckbox')
	checkbox.type = 'checkbox'
	checkbox.dataset.valueid = valueId
	checkbox.checked = localStorage[valueId] == 'true'

	checkbox.addEventListener('change',(event)=>{
		localStorage[valueId] = event.target.checked
	})

	const container = createDiv('item value')
	container.append(checkbox)

	return container
}

function displayTraits(item) {
	for (let traitName of item.traits) {
		traitList.append(createDiv('item',traitName))
		traitList.append(createTraitValue(`${item.name}:${traitName}:I`))
		traitList.append(createTraitValue(`${item.name}:${traitName}:II`))
		traitList.append(createTraitValue(`${item.name}:${traitName}:III`))
		traitList.append(createTraitValue(`${item.name}:${traitName}:IV`))
	}
}

(async function() {
	const meleeData = await loadJson('data/melee.json','melee')
	const rangedData = await loadJson('data/ranged.json','ranged')

	const weaponMap = {}
	mapData(meleeData,weaponMap)
	mapData(rangedData,weaponMap)

	console.debug('Loaded melee data:',meleeData)
	console.debug('Loaded ranged data:',rangedData)

	document.querySelector('#meleeButton').addEventListener('click',()=> {
		loadData(meleeData)
	})

	document.querySelector('#rangedButton').addEventListener('click',()=> {
		loadData(rangedData)
	})

	weaponSelector.addEventListener('change',(event)=> {
		console.debug('Selection change:',event.target.value,weaponMap[event.target.value])
		clearTraits()
		displayTraits(weaponMap[event.target.value])
	})

	loadData(meleeData)
})()
