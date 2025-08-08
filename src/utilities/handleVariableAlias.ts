import { tokenExportKeyType } from '@typings/tokenExportKey'
import { tokenTypes } from '@config/tokenTypes'

import { getVariableTypeByValue } from '@utils/getVariableTypeByValue'
import { changeNotation } from '@utils/changeNotation'

async function handleVariableAlias (
  variable: Variable & { aliasSameMode?: boolean },
  value: { id: string },
  mode: { modeId: string; name: string },
  aliasSameMode = false
) {
  const resolvedAlias = await figma.variables.getVariableByIdAsync(value.id)
  const collection = await figma.variables.getVariableCollectionByIdAsync(
    resolvedAlias.variableCollectionId
  )

  // Find matching mode or use first available
  const variableMode = collection.modes.find(m => m.name === mode.name) || collection.modes[0]

  // PROBLEM: fill-b-20 is using the mode from the VARIABLE and not the ALIAS!
  if (variable.name.includes('fill-b-20')) {
    console.log('Variable name:', variable.name);
    console.log('Variable mode:', variableMode.name);
    console.log('(Alias) mode:', mode.name);
    
  }

  return {
    description: variable.description || '',
    exportKey: tokenTypes.variables.key as tokenExportKeyType,
    category: getVariableTypeByValue(
      Object.values(resolvedAlias.valuesByMode)[0]
    ),
    values: `{${collection.name.toLowerCase()}.${changeNotation(
      resolvedAlias.name,
      '/',
      '.'
    )}}`,

    // this is being stored so we can properly update the design tokens later to account for all
    // modes when using aliases
    aliasCollectionName: collection.name.toLowerCase(),
    
    // ========================================
    // SOMEHOW we need to get the settings.modeInTokenValueCorrectly
    // into this function and flip from `mode` to `variableMode` below
    // ========================================
    aliasMode: mode,
    // aliasMode: variableMode, // This is the modified version!!!!!!!!!!!
    
    aliasSameMode: variable.aliasSameMode || aliasSameMode
  }
}

export default handleVariableAlias
