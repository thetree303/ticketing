import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Save,
  Loader2,
  Lock,
  Upload,
  Edit2,
  X,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/api";
import { PROFILE_UPDATED_EVENT } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State quản lý chế độ xem/sửa

  // Dữ liệu User hiển thị (Gốc)
  const [userInfo, setUserInfo] = useState({
    id: 0,
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatarUrl: "",
    role: "",
    dateOfBirth: "",
    gender: "",
  });

  // Dữ liệu User trong form chỉnh sửa (Temp)
  const [editForm, setEditForm] = useState(userInfo);

  // Dữ liệu Password
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Upload avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "organizer":
        return "Người tổ chức";
      case "customer":
        return "Khách hàng";
      default:
        return "Thành viên";
    }
  };

  const handleDateChange = (date: Date | null) => {
    setEditForm({ ...editForm, dateOfBirth: date ? date.toISOString() : "" });
  };

  // Fetch dữ liệu
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        const loadedData = {
          id: data.id || 0,
          username: data.username || "",
          fullName: data.fullName || "Người dùng",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          avatarUrl: data.avatarUrl || "",
          role: data.role || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
        };
        setUserInfo(loadedData);
        setEditForm(loadedData); // Sync form edit với data gốc
      } catch {
        toast.error("Không thể tải thông tin cá nhân");
      }
    };
    fetchProfile();
  }, []);

  // Xử lý bật/tắt chế độ edit
  const toggleEdit = () => {
    if (isEditing) {
      // Nếu đang edit mà hủy -> Reset form về data gốc
      setEditForm(userInfo);
    }
    setIsEditing(!isEditing);
  };

  // Xử lý cập nhật thông tin
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi API update (bao gồm cả email, username, address nếu backend hỗ trợ)
      await authService.updateProfile(userInfo.id, {
        fullName: editForm.fullName,
        username: editForm.username,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        dateOfBirth: editForm.dateOfBirth || null,
        gender: editForm.gender || null,
      });

      // Update thành công -> Cập nhật data gốc & tắt edit mode
      setUserInfo(editForm);
      setIsEditing(false);
      toast.success("Đã cập nhật hồ sơ thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passwords.currentPassword === passwords.newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại!");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowSuccessDialog(true);
    } catch (error: any) {
      let errorMessage = "Lỗi đổi mật khẩu";
      if (error.response?.data?.message)
        errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogout = () => {
    setShowSuccessDialog(false);
    clearAuth();
    navigate("/login");
  };

  // Xử lý upload avatar
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ cho phép upload file ảnh!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File ảnh không được vượt quá 2MB!");
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await authService.uploadAvatar(formData);

      await authService.updateProfile(userInfo.id, {
        avatarUrl: response.url,
      });

      setUserInfo((prev) => ({ ...prev, avatarUrl: response.url }));
      setEditForm((prev) => ({ ...prev, avatarUrl: response.url }));
      toast.success("Upload ảnh đại diện thành công!");
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi upload ảnh");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await authService.updateProfile(userInfo.id, {
        avatarUrl: null,
      });
      setUserInfo((prev) => ({ ...prev, avatar: "" }));
      setEditForm((prev) => ({ ...prev, avatar: "" }));
      toast.success("Đã xóa ảnh đại diện");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi xóa ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Xử lý Khóa tài khoản (Backend chưa có thì xử lý Frontend trước)
  const handleLockAccount = async () => {
    // Giả lập call API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Tài khoản đã bị khóa tạm thời.");
      // Logout để demo hiệu ứng khóa
      clearAuth();
      navigate("/login");
    }, 1500);
  };

  // Xử lý Xóa tài khoản vĩnh viễn
  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount(userInfo.id);
      toast.success("Đã xóa tài khoản.");
      clearAuth();
      navigate("/login");
    } catch (error: any) {
      toast.error("Lỗi xóa tài khoản: " + error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-1">
      <div className="container mx-auto max-w-5xl space-y-8 px-4">
        {/* --- HEADER PROFILE (Đã sửa Layout) --- */}
        <Card className="mt-8 overflow-visible border-none bg-white shadow-lg ring-1 ring-slate-100">
          {/* Background Cover giả lập */}
          <div className="px-8 py-8">
            <div className="flex flex-col items-center gap-8 sm:flex-row">
              {/* Avatar Group */}
              <div className="group relative shrink-0">
                <Avatar className="h-32 w-32 border-4 border-white bg-white shadow-md">
                  <AvatarImage
                    src={userInfo.avatarUrl}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-lime-200 text-4xl font-bold text-lime-800">
                    {userInfo.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Nút sửa avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      disabled={uploadingAvatar}
                      className="absolute right-2 bottom-2 cursor-pointer rounded-full bg-slate-800 p-2 text-white shadow-lg transition-colors hover:bg-black disabled:opacity-50"
                      title="Đổi ảnh đại diện"
                    >
                      {uploadingAvatar ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Camera size={16} />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Đổi ảnh
                    </DropdownMenuItem>
                    {userInfo.avatarUrl && (
                      <DropdownMenuItem
                        onClick={handleDeleteAvatar}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa ảnh
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Tên và Role (Nằm ngang với avatar) */}
              <div className="flex-1 space-y-1 text-center sm:mt-4 sm:text-left">
                <h1 className="text-3xl font-bold text-slate-900">
                  {userInfo.fullName}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500 sm:justify-start">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    @{userInfo.username || "chưa_cập_nhật"}
                  </div>
                  <Badge
                    variant="secondary"
                    className="border-lime-100 bg-lime-50 text-lime-700 hover:bg-lime-100"
                  >
                    {getRoleBadge(userInfo.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* --- SECTION 1: THÔNG TIN CÁ NHÂN (VIEW & EDIT MODE) --- */}
        <Card className="border-none shadow-md ring-1 ring-slate-100">
          <CardHeader className="flex flex-col justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-lime-100 p-2 text-lime-600">
                <User size={20} />
              </div>
              <div>
                <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
              </div>
            </div>

            {/* Nút Edit Profile (Góc phải) */}
            <div>
              {!isEditing ? (
                <Button
                  onClick={toggleEdit}
                  variant="outline"
                  className="gap-2 border-slate-300"
                >
                  <Edit2 size={16} /> Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <Button
                  onClick={toggleEdit}
                  variant="outline"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 border-destructive/20 gap-2 border-2"
                >
                  <X size={16} /> Hủy bỏ
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator className="bg-slate-100" />

          <CardContent className="pt-6">
            {isEditing ? (
              <form
                id="profile-form"
                onSubmit={handleUpdateInfo}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={editForm.fullName}
                    className="mt-2"
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={editForm.username}
                    className="mt-2"
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editForm.email}
                    className="mt-2"
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={editForm.phoneNumber}
                    className="mt-2"
                    onChange={(e) =>
                      setEditForm({ ...editForm, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <div className="flex items-center gap-2">
                    <DatePicker
                      date={
                        editForm.dateOfBirth
                          ? new Date(editForm.dateOfBirth)
                          : null
                      }
                      setDate={handleDateChange}
                      className="mt-2 w-full text-black focus-visible:ring-lime-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, gender: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={editForm.address}
                    className="mt-2"
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    placeholder="Nhập địa chỉ của bạn"
                  />
                </div>
              </form>
            ) : (
              // --- MODE: XEM THÔNG TIN ---
              <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
                <div>
                  <Label className="font-normal text-slate-500">
                    Họ và tên
                  </Label>
                  <div className="text-lg font-medium text-slate-900">
                    {userInfo.fullName}
                  </div>
                </div>
                <div>
                  <Label className="font-normal text-slate-500">Username</Label>
                  <div className="text-lg font-medium text-slate-900">
                    @{userInfo.username || "---"}
                  </div>
                </div>
                <div>
                  <Label className="font-normal text-slate-500">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-lg font-medium text-slate-900">
                      {userInfo.email}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="font-normal text-slate-500">
                    Số điện thoại
                  </Label>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-lg font-medium text-slate-900">
                      {userInfo.phoneNumber || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>{" "}
                <div>
                  <Label className="font-normal text-slate-500">
                    Ngày sinh
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-lg font-medium text-slate-900">
                      {userInfo.dateOfBirth
                        ? new Date(userInfo.dateOfBirth).toLocaleDateString(
                            "vi-VN",
                          )
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="font-normal text-slate-500">
                    Giới tính
                  </Label>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <span className="text-lg font-medium text-slate-900">
                      {userInfo.gender === "male"
                        ? "Nam"
                        : userInfo.gender === "female"
                          ? "Nữ"
                          : userInfo.gender === "other"
                            ? "Khác"
                            : "Chưa cập nhật"}
                    </span>
                  </div>
                </div>{" "}
                <div className="md:col-span-2">
                  <Label className="font-normal text-slate-500">Địa chỉ</Label>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-lg font-medium text-slate-900">
                      {userInfo.address || "Chưa cập nhật địa chỉ"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {isEditing && (
            <CardFooter className="flex justify-end rounded-b-xl border-t border-slate-100 bg-slate-50/50 px-6 pt-2 pb-6">
              <Button
                form="profile-form"
                type="submit"
                disabled={loading}
                className="gap-2 px-6"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Lưu thay đổi
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* --- SECTION 2: ĐỔI MẬT KHẨU --- */}
        <Card className="border-none shadow-md ring-1 ring-slate-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-lime-100 p-2 text-lime-600">
                <Lock size={20} />
              </div>
              <CardTitle className="text-xl">Đổi mật khẩu</CardTitle>
            </div>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <form onSubmit={handleChangePassword}>
            <CardContent className="grid grid-cols-1 space-y-4 gap-x-4 pt-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Mật khẩu hiện tại</Label>
                <Input
                  type="password"
                  className="mt-2"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <Input
                  type="password"
                  className="mt-2"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Xác nhận mật khẩu</Label>
                <Input
                  type="password"
                  className="mt-2"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end px-6 pb-6">
              <Button type="submit" variant="default" disabled={loading}>
                Cập nhật mật khẩu
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* --- SECTION 3: VÙNG NGUY HIỂM (KHÓA & XÓA) --- */}
        <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Khóa tài khoản */}
          <Card className="bg-orange-50/30 shadow-sm ring-1 ring-orange-100">
            <CardContent className="pt-6">
              <h3 className="mb-2 text-lg font-bold text-orange-900">
                Khóa tài khoản
              </h3>
              <p className="mb-4 h-10 text-sm text-slate-600">
                Tạm thời vô hiệu hóa tài khoản. Bạn có thể mở lại bằng cách đăng
                nhập.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
                  >
                    <Lock size={16} className="mr-2" /> Khóa tạm thời
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Khóa tài khoản?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn sẽ bị đăng xuất khỏi hệ thống. Tài khoản sẽ ở trạng
                      thái "Tạm khóa".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLockAccount}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Xác nhận khóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Xóa tài khoản */}
          <Card className="bg-red-50/30 shadow-sm ring-1 ring-red-100">
            <CardContent className="pt-6">
              <h3 className="mb-2 text-lg font-bold text-red-900">
                Xóa tài khoản
              </h3>
              <p className="mb-4 h-10 text-sm text-slate-600">
                Xóa vĩnh viễn dữ liệu cá nhân và lịch sử đặt vé. Không thể khôi
                phục.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                  >
                    <Trash2 size={16} className="mr-2" /> Xóa vĩnh viễn
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                      Cảnh báo xóa tài khoản
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này sẽ xóa vĩnh viễn tài khoản{" "}
                      <b>{userInfo.username}</b>. Dữ liệu không thể khôi phục.
                      Bạn chắc chắn chứ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa vĩnh viễn
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog thông báo thành công */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đổi mật khẩu thành công</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng đăng nhập lại với mật khẩu mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmLogout}>
              Đăng nhập lại
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
