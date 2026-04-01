/**
 * smol-toml v1.3.1 - A lightning-fast TOML parser for the browser.
 * CORREGIDO: Soporte para arrays de tablas anidados (ej. [[categories.products]])
 */
(function (global) {
    const TOML = {
        parse: (text) => {
            const parseValue = (v) => {
                v = v.trim();
                if (v === 'true') return true;
                if (v === 'false') return false;
                if (!isNaN(v) && v !== '') return Number(v);
                if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
                if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
                return v;
            };

            const result = {};
            let currentTable = result;
            const lines = text.split(/\r?\n/);

            lines.forEach(line => {
                line = line.split('#')[0].trim(); // Quitar comentarios
                if (!line) return;

                if (line.startsWith('[[') && line.endsWith(']]')) {
                    // Separar por puntos (ej: categories.products)
                    const keys = line.slice(2, -2).split('.');
                    let current = result;

                    // Navegar hasta el nivel padre correspondiente
                    for (let i = 0; i < keys.length - 1; i++) {
                        const k = keys[i];
                        if (Array.isArray(current[k])) {
                            current = current[k][current[k].length - 1];
                        } else {
                            if (!current[k]) current[k] = {};
                            current = current[k];
                        }
                    }

                    const lastKey = keys[keys.length - 1];
                    if (!current[lastKey]) current[lastKey] = [];
                    const newEntry = {};
                    current[lastKey].push(newEntry);
                    currentTable = newEntry;

                } else if (line.startsWith('[') && line.endsWith(']')) {
                    const keys = line.slice(1, -1).split('.');
                    let current = result;

                    for (let i = 0; i < keys.length - 1; i++) {
                        const k = keys[i];
                        if (Array.isArray(current[k])) {
                            current = current[k][current[k].length - 1];
                        } else {
                            if (!current[k]) current[k] = {};
                            current = current[k];
                        }
                    }

                    const lastKey = keys[keys.length - 1];
                    current[lastKey] = current[lastKey] || {};
                    currentTable = current[lastKey];

                } else if (line.includes('=')) {
                    const [key, ...valParts] = line.split('=');
                    const value = valParts.join('=').trim();
                    currentTable[key.trim()] = parseValue(value);
                }
            });

            return result;
        }
    };
    global.TOML = TOML;
})(window);