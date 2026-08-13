# Prompt de revisión de ejecución

Usa este prompt después de la implementación y la verificación, pero antes de abrir el pull request.

## Objetivo

Auditar el estado actual del repositorio y los artefactos de control STPR que lo moldearon.
Este paso no es para terminar código. Es para evaluar si el sistema STPR actual evitó ambigüedad, deriva y errores repetidos.

## Instrucciones

1. Audita el estado actual del repositorio contra:
   - `.stpr/template/`
   - `.stpr/template/STPR_INVARIANTS.md`
   - `AGENTS.md`
   - los artefactos de plan relevantes de `.stpr/plan/` cuando existan

2. Verifica el resultado usando:
   - `.stpr/review/CHECKLIST_REVISION.md`

3. No arregles el proyecto directamente en este paso salvo que se te pida explícitamente.

4. Evalúa solo el estado actual del repositorio.
   - No describas errores históricos, estados intermedios ni problemas ya corregidos.
   - No uses frases como «inicialmente», «antes», «durante la implementación», «previamente» o equivalentes.
   - Si algo es correcto en el estado actual, no lo reportes como problema.

5. Si encuentras desviaciones, deriva, errores repetidos o ambigüedad evitable:
   - identifica si el problema pertenece al template, a las invariantes, a los artefactos de plan, a los prompts o a los artefactos de review
   - explica qué artefacto fuente debería haber evitado el problema
   - propone mejoras concretas en esos artefactos para ejecuciones futuras
   - céntrate en mejorar el sistema que produjo el resultado, no solo el resultado

6. Al revisar archivos generados:
   - reporta solo problemas reales y verificables que sigan existiendo
   - distingue entre un problema actual real y una desviación menor de paridad/estilo
   - si una preocupación ya no existe, omítela

## Salida esperada

## Problemas actuales

- Hallazgos ordenados por severidad
- Solo problemas reales actuales
- Prefiere referencias archivo por archivo

## Desviaciones menores

- Incluye paridad, estilo, trazabilidad o cobertura que no rompen el resultado aprobado

## Desviaciones de template o invariantes

- Lista solo las desviaciones que siguen existiendo en el estado actual del repositorio

## Elementos del checklist no satisfechos

- Incluye solo los elementos de `.stpr/review/CHECKLIST_REVISION.md` que no se cumplen ahora

## Artefacto fuente a ajustar

- Para cada problema importante, nombra el artefacto que debería mejorarse:
  - template
  - invariantes
  - artefactos de plan
  - prompts
  - artefactos de review

## Propuestas de mejora

- Cambios concretos a los artefactos STPR que evitarían el problema en ejecuciones futuras

## Riesgos residuales

- Solo riesgos residuales actuales

## Notas

- Prefiere señalar el artefacto fuente que debería impedir el problema en el futuro.
- Si el resultado generado es correcto pero el proceso fue innecesariamente ambiguo, propón ajustar el artefacto que debería haber hecho explícita la decisión.
- Mantén este prompt distinto del de revisión de pull request: este es para revisión de ejecución pre-PR y mejora del método, no para merge readiness.
- No mezcles problemas ya corregidos con problemas actuales.
- Si en un archivo no hay problema actual, no lo inventes.