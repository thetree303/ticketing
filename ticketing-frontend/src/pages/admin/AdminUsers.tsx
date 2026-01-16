import React, { useEffect, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  Unlock,
  Plus,
  Lock,
  Trash2,
} from "lucide-react";
import { userService } from "../../services/api";
import type { User as UserType, PaginatedResponse } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";
import CreateUserDialog from "@/components/CreateUserDialog";
import StatusBadge from "@/components/StatusBadge";

const AdminUsers: React.FC = () => {
  const [usersData, setUsersData] =
    useState<PaginatedResponse<UserType> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Action State
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setUsersData(res);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Update User Status Handler
  const handleUpdateStatus = async () => {
    if (!selectedUser || !newStatus) return;
    try {
      await userService.updateUserStatus(selectedUser.id, newStatus);
      toast.success(
        newStatus === "banned"
          ? "Đã chặn người dùng thành công"
          : "Đã mở khóa người dùng thành công",
      );
      setIsStatusDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái. Vui lòng thử lại.",
      );
    }
  };

  const handleLockUser = async () => {
    if (!selectedUser) return;
    try {
      await userService.blockUser(selectedUser.id);
      toast.success("Đã khóa tài khoản thành công");
      setIsLockDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể khóa tài khoản. Vui lòng thử lại.",
      );
    }
  };

  const handleUnlockUser = async () => {
    if (!selectedUser) return;
    try {
      await userService.unblockUser(selectedUser.id);
      toast.success("Đã mở khóa tài khoản thành công");
      setIsUnlockDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể mở khóa tài khoản. Vui lòng thử lại.",
      );
    }
  };

  const handleSoftDelete = async () => {
    if (!selectedUser) return;
    try {
      await userService.softDeleteUser(selectedUser.id);
      toast.success("Đã xóa người dùng thành công");
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể xóa người dùng. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-slate-500">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2 bg-lime-600 text-white hover:bg-lime-700"
        >
          <Plus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo ID, tên, email..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <SelectValue placeholder="Vai trò" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="organizer">Organizer</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>ID</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-lime-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : usersData?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-slate-500"
                >
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              usersData?.data.map((user) => (
                <TableRow
                  key={user.id}
                  className={
                    user.status === "locked"
                      ? "bg-slate-50 opacity-60"
                      : undefined
                  }
                >
                  <TableCell className="font-mono font-medium">
                    {user.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.status === "locked" && (
                        <Lock className="h-4 w-4 text-orange-500" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {user.fullName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.role} type="role" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} type="user" />
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={user.status === "locked"}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Xem thông tin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "locked" ? (
                          <DropdownMenuItem
                            className="text-green-600 focus:text-green-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUnlockDialogOpen(true);
                            }}
                          >
                            <Unlock className="mr-2 h-4 w-4" /> Mở khóa
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-orange-600 focus:text-orange-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsLockDialogOpen(true);
                            }}
                          >
                            <Lock className="mr-2 h-4 w-4" /> Khóa tài khoản
                          </DropdownMenuItem>
                        )}
                        {user.status !== "banned" ? (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewStatus("banned");
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" /> Chặn người dùng
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600 focus:text-green-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewStatus("active");
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            <Unlock className="mr-2 h-4 w-4" /> Bỏ chặn
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {usersData && usersData.meta.totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 md:flex-row">
            <div className="text-sm text-slate-500">
              Hiển thị{" "}
              <strong>
                {(usersData.meta.currentPage - 1) *
                  usersData.meta.itemsPerPage +
                  1}
                -
                {Math.min(
                  usersData.meta.currentPage * usersData.meta.itemsPerPage,
                  usersData.meta.totalItems,
                )}
              </strong>{" "}
              trên <strong>{usersData.meta.totalItems}</strong> người dùng
            </div>
            <Pagination
              currentPage={page}
              totalPages={usersData.meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <span className="font-bold text-slate-900">
                {selectedUser?.fullName}
              </span>{" "}
              (ID: {selectedUser?.id})? Đây là xóa mềm, dữ liệu vẫn được lưu
              trong cơ sở dữ liệu nhưng người dùng sẽ không thể đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleSoftDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock User Dialog */}
      <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Khóa tài khoản người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khóa tài khoản của{" "}
              <span className="font-bold text-slate-900">
                {selectedUser?.fullName}
              </span>
              ? Người dùng sẽ không thể đăng nhập vào hệ thống cho đến khi được
              mở khóa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLockDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleLockUser}
            >
              Khóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock User Dialog */}
      <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mở khóa tài khoản người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn mở khóa tài khoản của{" "}
              <span className="font-bold text-slate-900">
                {selectedUser?.fullName}
              </span>
              ? Người dùng sẽ có thể đăng nhập trở lại vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnlockDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleUnlockUser}
            >
              Mở khóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của người dùng (chỉ đọc)
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">ID</p>
                  <p className="text-base text-slate-900">#{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Họ và tên
                  </p>
                  <p className="text-base text-slate-900">
                    {selectedUser.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-base text-slate-900">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Vai trò</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedUser.role} type="role" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Trạng thái
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={selectedUser.status} type="user" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Ngày tham gia
                  </p>
                  <p className="text-base text-slate-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
              {selectedUser.phoneNumber && (
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Số điện thoại
                  </p>
                  <p className="text-base text-slate-900">
                    {selectedUser.phoneNumber}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchUsers}
      />

      {/* Status Change Confirmation Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === "banned"
                ? "Chặn người dùng"
                : "Mở khóa người dùng"}
            </DialogTitle>
            <DialogDescription>
              {newStatus === "banned" ? (
                <>
                  Bạn có chắc chắn muốn chặn người dùng{" "}
                  <span className="font-bold text-slate-900">
                    {selectedUser?.fullName}
                  </span>
                  ? Họ sẽ không thể đăng nhập vào hệ thống.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn mở khóa người dùng{" "}
                  <span className="font-bold text-slate-900">
                    {selectedUser?.fullName}
                  </span>
                  ? Họ sẽ có thể đăng nhập trở lại.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant={newStatus === "banned" ? "destructive" : "default"}
              onClick={handleUpdateStatus}
            >
              {newStatus === "banned" ? "Chặn" : "Mở khóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
