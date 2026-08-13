# Prompt de revisión de pull request

Usa este prompt después de abrir el pull request.

## Objetivo

Revisar el pull request por merge readiness.
Céntrate en problemas reales del cambio propuesto, no en reimplementarlo.

## Instrucciones

1. Revisa el diff del pull request contra:
   - `.stpr/template/`
   - `.stpr/template/STPR_INVARIANTS.md`
   - `.stpr/review/CHECKLIST_REVISION.md`
   - `AGENTS.md`
   - los artefactos de plan relevantes de `.stpr/plan/` cuando existan

2. Prioriza:
   - bugs
   - regresiones de comportamiento
   - deriva de contrato (UI, datos, contratos de repositorio, commands Tauri)
   - verificación faltante o incorrecta
   - huecos de documentación

3. No sugieras reescrituras especulativas cuando la implementación actual es correcta.

4. Reporta solo problemas que sigan existiendo en el PR tal como se abrió.
   - No discutas estados intermedios ya corregidos.
   - No inventes preocupaciones para que la revisión parezca exhaustiva.

5. Distingue claramente entre:
   - hallazgos bloqueantes
   - hallazgos no bloqueantes
   - riesgos residuales

6. Cuando sea posible, cita archivos y líneas concretas del PR.

## Salida esperada

## Hallazgos bloqueantes

- Hallazgos que deberían bloquear el merge
- Ordenados por severidad
- Prefiere referencias de archivo y línea

## Hallazgos no bloqueantes

- Problemas menores, pulido o seguimientos que no bloquean el merge

## Huecos del checklist

- Elementos de `.stpr/review/CHECKLIST_REVISION.md` que no se cumplen en el PR

## Deriva de template o invariantes

- Desviaciones de `.stpr/template/` o `.stpr/template/STPR_INVARIANTS.md` que siguen existiendo en el PR

## Riesgos residuales

- Riesgos reales restantes tras el merge, si los hay

## Recomendación de merge

- `ready`
- `ready with non-blocking follow-ups`
- `needs changes`