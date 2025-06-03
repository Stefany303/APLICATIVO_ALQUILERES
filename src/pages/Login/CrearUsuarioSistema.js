// import { useState } from "react";
// import { Modal, Form, Input, Button, Checkbox } from "antd";

// export default function CrearUsuarioSistemaModal() {
//   const [createAccount, setCreateAccount] = useState(false);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = () => {
//     console.log("Usuario registrado:", { username, password });
//     setCreateAccount(false); // Cerrar modal después de registrar
//   };

//   return (
//     <>
//       {/* Checkbox que abre el modal */}
//       <Form layout="vertical">
//         <Form.Item>
//           <Checkbox checked={createAccount} onChange={() => setCreateAccount(!createAccount)}>
//             Crear cuenta de usuario
//           </Checkbox>
//         </Form.Item>
//       </Form>

//       {/* Modal */}
//       <Modal
//         title="Registrar Usuario"
//         open={createAccount}
//         onCancel={() => setCreateAccount(false)}
//         footer={null} // Oculta los botones por defecto
//       >
//         <Form layout="vertical" onFinish={handleSubmit}>
//           <Form.Item label="Nombre de Usuario">
//             <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
//           </Form.Item>

//           <Form.Item label="Contraseña">
//             <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               Registrar
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// }

 import { useState } from "react";
 import { Modal, Form, Input, Button } from "antd";

export default function CrearUsuarioSistemaModal({ createAccount, setCreateAccount }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
  
    const handleSubmit = () => {
      setCreateAccount(false); // Cerrar modal después de registrar
    };
  
    return (
      <Modal
        title="Registrar Usuario"
        open={createAccount}
        onCancel={() => setCreateAccount(false)}
        footer={null} // Oculta los botones por defecto
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Nombre de Usuario">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </Form.Item>
  
          <Form.Item label="Contraseña">
            <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Item>
  
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Registrar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
  