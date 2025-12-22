import { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Accedemos al servicio de usuarios del plugin 'users-permissions'
    const extensionService = strapi.plugin('users-permissions').service('user');
    
    // Guardamos la función original 'add' para no romper nada
    const originalAdd = extensionService.add;

    // Sobrescribimos la función 'add' con nuestra lógica personalizada
    extensionService.add = async (values) => {
      
      console.log("Interceptando creación de usuario para asignar ID...");

      // 1. Buscamos el último usuario creado en la base de datos
      // Ordenamos por fecha de creación descendente (el más nuevo primero)
      const users = await strapi.db.query('plugin::users-permissions.user').findMany({
        orderBy: { createdAt: 'desc' },
        limit: 1,
      });

      const lastUser = users.length > 0 ? users[0] : null;

      let nextNumber = 1;
      const currentYear = new Date().getFullYear(); // 2025, 2026...

      // 2. Si existe un usuario anterior y tiene un affiliate_number
      if (lastUser && lastUser.affiliate_number) {
        // El formato esperado es: AMGO-2025-XXXX
        const parts = lastUser.affiliate_number.split('-');
        
        // parts[0] = "AMGO"
        // parts[1] = "2025"
        // parts[2] = "0001" (Este es el que nos interesa)

        // Verificamos si el usuario anterior es del mismo año
        if (parts[1] === currentYear.toString()) {
            const lastSequence = parseInt(parts[2]);
            if (!isNaN(lastSequence)) {
                nextNumber = lastSequence + 1;
            }
        } else {
            // Si cambió el año (ej: estamos en 2026 pero el último fue 2025), reiniciamos a 1
            nextNumber = 1;
        }
      }

      // 3. Formateamos el número con ceros a la izquierda (padding)
      // Ejemplo: 1 -> "0001", 15 -> "0015"
      const sequenceString = nextNumber.toString().padStart(4, '0');
      
      // Construimos el ID final
      const newId = `AMGO-${currentYear}-${sequenceString}`;

      console.log(`Generando nuevo ID de Afiliado: ${newId}`);

      // 4. Inyectamos el nuevo ID en los valores que se van a guardar
      values.affiliate_number = newId;

      // 5. Llamamos a la función original para que Strapi guarde en Postgres
      return originalAdd.call(extensionService, values);
    };
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};