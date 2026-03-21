La equivalencia entre un megavatio-hora (MWh) y las toneladas de dióxido de carbono ($CO\_2$) no es un valor universal fijo; depende estrictamente de la **fuente de energía** utilizada para generar esa electricidad (el llamado "mix energético").

Para obtener un cálculo preciso, se utiliza el **factor de emisión**, que representa cuántos kilogramos de $CO\_2$ se liberan a la atmósfera por cada MWh producido.

### **1\. Estimaciones Generales (Promedios)**

Si se toma como referencia un mix energético diversificado (como el de Estados Unidos o promedio global), las cifras suelen rondar los siguientes valores:

* **Promedio Global:** Aproximadamente **0.4 a 0.5 toneladas de $CO\_2$ por MWh**.  
* **En términos de red eléctrica:** $1 \\text{ MWh} \\approx 475 \\text{ kg } CO\_2$ ($0.475 \\text{ t}$).

---

### **2\. Equivalencia según la Fuente de Generación**

El impacto varía drásticamente dependiendo de si la energía es fósil o renovable:

| Fuente de Energía | kg de CO2​ por MWh | Toneladas de CO2​ por MWh |
| :---- | :---- | :---- |
| **Carbón** | \~900 \- 1,000 kg | **0.9 \- 1.0 t** |
| **Gas Natural** | \~400 \- 500 kg | **0.4 \- 0.5 t** |
| **Solar Fotovoltaica** | \~30 \- 50 kg\* | **0.03 \- 0.05 t** |
| **Eólica / Hidro** | \~10 \- 25 kg\* | **0.01 \- 0.02 t** |

*Nota: Para las renovables, estas emisiones suelen ser "de ciclo de vida" (construcción y mantenimiento), ya que la generación operativa es prácticamente cero.*

---

### **3\. Consideraciones para Proyectos de Tokenización (RWA)**

Si estás calculando esto para la emisión de certificados de carbono o activos ambientales (como I-RECs), es vital considerar:

1. **Factor de Emisión Local:** Cada país tiene su propia intensidad de carbono. Por ejemplo, un MWh generado en una red basada en hidroeléctrica (como Noruega o partes de Sudamérica) tendrá una equivalencia en $CO\_2$ mucho menor que uno en una red basada en carbón.  
2. **Metodología de Adicionalidad:** Para convertir el ahorro de energía en créditos de carbono, se suele comparar la energía renovable inyectada contra el "escenario base" de la red local.

### **¿Cómo realizar el cálculo exacto?**

Si tienes el factor de emisión de una región específica (denominado $FE$), la fórmula es:

$$\\text{Toneladas } CO\_2 \= \\frac{\\text{MWh} \\times FE \\text{ (en kg/MWh)}}{1,000}$$  
