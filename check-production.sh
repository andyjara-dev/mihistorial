#!/bin/bash

echo "=== Revisando logs de Docker ==="
docker logs health-tracker --tail 50

echo ""
echo "=== Verificando variables de entorno públicas ==="
echo "Estas variables DEBEN estar disponibles en el cliente:"
echo ""

# Revisar si el contenedor está corriendo
if docker ps | grep -q health-tracker; then
    echo "✓ Contenedor corriendo"

    # Verificar variables de entorno dentro del contenedor
    echo ""
    echo "Variables NEXT_PUBLIC en el contenedor:"
    docker exec health-tracker printenv | grep NEXT_PUBLIC || echo "❌ No se encontraron variables NEXT_PUBLIC"

    echo ""
    echo "NEXTAUTH_URL:"
    docker exec health-tracker printenv | grep NEXTAUTH_URL || echo "❌ NEXTAUTH_URL no configurada"
else
    echo "❌ Contenedor 'health-tracker' no está corriendo"
    echo ""
    echo "Contenedores disponibles:"
    docker ps
fi
