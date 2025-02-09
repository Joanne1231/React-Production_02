import { useState } from 'react';
import axios from 'axios';


function App() {
  const base_Api = `${import.meta.env.VITE_BASE_URL}`;
  const user_API = `${import.meta.env.VITE_API_PATH}`;
  // 登入狀態
  const [isLogin, setIsLogin] = useState(false);

  const [temProduct, setTemProduct] = useState({});
  // 取得產品列表
  const [productList, setProductList] = useState([]);
  const viewProduct = (product) => {
    setTemProduct((prevProduct) => {
      // 加入判斷是否點擊同一個商品
      if (prevProduct.id === product.id) {
        return {};
      }
      // 如果不是同一個商品，則回傳點擊的商品
      return product;
    });
  };
  // 設定登入帳號密碼
  const [account, setAccount] = useState({
    username: "",
    password: ""
  })
  // 取得輸入的帳號密碼
  const inputChange = (e) => {
    setAccount({
      ...account,
      [e.target.name]: e.target.value
    })
  }

  // 登入
  const btnLogin = async (e) => {
    e.preventDefault();


    await axios.post(`${import.meta.env.VITE_BASE_URL}v2/admin/signin`, account).then((res) => {

      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
      axios.defaults.headers.common['Authorization'] = token;

      if (res.data.success) {
        alert('登入成功', res.data.message);
        axios.get(`${base_Api}v2/api/${user_API}/products`).then((res) => {

          setProductList(res.data.products);

          setIsLogin(true);
        }).catch((err) => {
          alert('取得產品列表失敗', err.message);
        })

      } else {
        setIsLogin(false);
        alert('登入失敗', res.data.message);
      }
    }
    ).catch((err) => {
      alert('登入失敗', err.message);
    })
  }

  // 檢查使用者是否登入
  const checkLogin = () => {
    axios.post(`${base_Api}v2/api/user/check`).then((res) => {
      if (res.data.success) {
        alert('使用者已登入')
      } else {
        alert('使用者未登入');
        setIsLogin(false);
      }
    }).catch((err) => {
      alert('檢查使用者是否登入失敗', err.message);
    })
  }



  return (
    <>
      {isLogin ? (
        <div className="container">
          <div className='d-flex justify-content-start'>
            <button type="button" className='btn btn-info' onClick={checkLogin}>檢查使用者是否登入</button>
          </div>
          <div className="row mt-5">
            {/* 左側產品列表 */}
            <div className="col-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {/** key值設定為該筆id */}
                  {productList.map((item) => (
                    <tr key={item.id}>
                      <th scope="col">
                        <p className="font-monospace">{item.title}</p>
                      </th>
                      <td>
                        <p>
                          ${item.origin_price}／
                          {item.unit}
                        </p>
                      </td>
                      <td>
                        <p>
                          ${item.price}／
                          {item.unit}
                        </p>
                      </td>
                      <td>
                        <p>{item.is_enabled === "1" ? "是" : "否"}</p>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            viewProduct(item);
                          }}
                        >
                          {temProduct.id !== item.id ? "查看細節" : "關閉"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/** 右側產品細節 */}
            <div className="col-6">
              <h2>單一產品細節</h2>
              {temProduct.category ? (
                <div className="card">
                  <img src={temProduct.imageUrl} className="card-img-top" />
                  <div className="card-body">
                    <div className='d-flex justify-content-start align-items-center'>
                      <h5 className="card-title my-3">
                        {temProduct.title}
                      </h5>
                      <span className="badge rounded-pill bg-info text-dark">
                        {temProduct.category}
                      </span>
                    </div>
                    <div className='text-start'>
                      <ul className="list-group list-group-flush">
                        商品描述
                      </ul>
                      <li className='list-group-item'>{temProduct.description}</li>
                    </div>
                    <div className='text-start my-3'>
                      <ul className="list-group list-group-flush">
                        商品內容
                      </ul>
                      <li className='list-group-item'>{temProduct.content}</li>
                    </div>
                    <p className="card-text d-flex justify-content-start">
                      <del>{temProduct.origin_price}</del> /<p className='text-danger'>{temProduct.price}
                      </p>元
                    </p>
                    <h5 className="card-title d-flex justify-content-start">
                      更多圖片
                    </h5>
                    <div className="row g-3">
                      {temProduct.imagesUrl?.map((item, index) => {
                        return (
                          <img
                            className="col-md-4"
                            src={item}
                            key={index}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p>請選擇一件商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (<div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h1 className="mb-5">請先登入</h1>
        <form className="d-flex flex-column gap-3" onSubmit={btnLogin}>
          <div className="form-floating mb-3">
            <input type="email" name='username' className="form-control" id="username"
              onChange={inputChange}
              value={account.username} placeholder="name@example.com" />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating d-flex align-items-center">
            <input type="password" name='password' className="form-control" id="password" data="passworedtype" value={account.password} onChange={inputChange} placeholder="Password" />
            {/* <i id="checkEye" className="fas fa-eye"></i> */}
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn btn-primary" type='submit'>登入</button>
        </form>
        <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
      </div>)}
    </>
  );
}



export default App
