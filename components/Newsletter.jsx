import React from 'react';

import Title from './Title';

const Newsletter = () => {
  return (
    <div className='flex flex-col items-center mx-4 my-36'>
      <Title title="Đăng ký nhận bản tin" description="Đăng ký để nhận các ưu đãi độc quyền, sản phẩm mới và thông tin nội bộ được gửi thẳng đến hộp thư của bạn mỗi tuần." visibleButton={false} />
      <div className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
        <input className='flex-1 pl-5 outline-none' type="text" placeholder='Nhập địa chỉ email của bạn' />
        <button className='font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition'>Nhận bản tin</button>
      </div>
    </div>
  );
}

export default Newsletter;