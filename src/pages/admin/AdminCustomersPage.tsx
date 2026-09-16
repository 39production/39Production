import {
  Edit,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  company: string
  address: string
  totalOrders: number
  totalSpent: number
  status: 'Active' | 'Inactive'
}

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+62 812-3456-7890',
    company: 'John Creative',
    address: 'Malang, East Java',
    totalOrders: 8,
    totalSpent: 12500000,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Sarah Wijaya',
    email: 'sarah.wijaya@example.com',
    phone: '+62 813-2222-1111',
    company: 'Wijaya Studio',
    address: 'Surabaya, East Java',
    totalOrders: 5,
    totalSpent: 8750000,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Michael Tan',
    email: 'michael.tan@example.com',
    phone: '+62 821-4567-8901',
    company: 'Tan Digital',
    address: 'Jakarta, Indonesia',
    totalOrders: 12,
    totalSpent: 24500000,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Andi Pratama',
    email: 'andi.pratama@example.com',
    phone: '+62 822-9876-5432',
    company: 'Pratama Group',
    address: 'Bandung, West Java',
    totalOrders: 3,
    totalSpent: 4200000,
    status: 'Inactive',
  },
  {
    id: 5,
    name: 'Nadia Putri',
    email: 'nadia.putri@example.com',
    phone: '+62 856-1234-5678',
    company: 'Nadia Creative',
    address: 'Yogyakarta, Indonesia',
    totalOrders: 7,
    totalSpent: 9800000,
    status: 'Active',
  },
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  status: 'Active' as 'Active' | 'Inactive',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function AdminCustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>(initialCustomers)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null)

  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchValue = search.toLowerCase()

      const matchesSearch =
        customer.name.toLowerCase().includes(searchValue) ||
        customer.email.toLowerCase().includes(searchValue) ||
        customer.phone.toLowerCase().includes(searchValue) ||
        customer.company.toLowerCase().includes(searchValue) ||
        customer.address.toLowerCase().includes(searchValue)

      const matchesStatus =
        statusFilter === 'All' ||
        customer.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [customers, search, statusFilter])

  const activeCount = customers.filter(
    (customer) => customer.status === 'Active',
  ).length

  const inactiveCount = customers.filter(
    (customer) => customer.status === 'Inactive',
  ).length

  const totalRevenue = customers.reduce(
    (total, customer) => total + customer.totalSpent,
    0,
  )

  function openAddModal() {
    setEditingCustomer(null)
    setForm(emptyForm)
    setError('')
    setIsModalOpen(true)
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer)

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address,
      status: customer.status,
    })

    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingCustomer(null)
    setForm(emptyForm)
    setError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()
    const company = form.company.trim()
    const address = form.address.trim()

    if (!name) {
      setError('Customer name is required.')
      return
    }

    if (!email) {
      setError('Email is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!phone) {
      setError('Phone number is required.')
      return
    }

    if (!company) {
      setError('Company is required.')
      return
    }

    if (!address) {
      setError('Address is required.')
      return
    }

    const duplicateEmail = customers.some(
      (customer) =>
        customer.email.toLowerCase() === email &&
        customer.id !== editingCustomer?.id,
    )

    if (duplicateEmail) {
      setError('A customer with this email already exists.')
      return
    }

    if (editingCustomer) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editingCustomer.id
            ? {
              ...customer,
              name,
              email,
              phone,
              company,
              address,
              status: form.status,
            }
            : customer,
        ),
      )
    } else {
      const newCustomer: Customer = {
        id: Date.now(),
        name,
        email,
        phone,
        company,
        address,
        totalOrders: 0,
        totalSpent: 0,
        status: form.status,
      }

      setCustomers((current) => [
        newCustomer,
        ...current,
      ])
    }

    closeModal()
  }

  function handleDelete(id: number) {
    const customer = customers.find(
      (item) => item.id === id,
    )

    if (!customer) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`,
    )

    if (!confirmed) return

    setCustomers((current) =>
      current.filter((item) => item.id !== id),
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-muted">
            Admin Panel
          </p>

          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
            Customers
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Manage customer information and account status.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={String(customers.length)}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          label="Active"
          value={String(activeCount)}
          icon={<UserCheck className="h-5 w-5" />}
        />

        <StatCard
          label="Inactive"
          value={String(inactiveCount)}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<UserCheck className="h-5 w-5" />}
        />
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-5">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customers..."
              className="w-full rounded-lg border border-border-default bg-bg-base py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-brand-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-border-default bg-bg-base">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-primary">
                  Customer
                </th>

                <th className="px-6 py-4 font-semibold text-text-primary">
                  Contact
                </th>

                <th className="px-6 py-4 font-semibold text-text-primary">
                  Company
                </th>

                <th className="px-6 py-4 font-semibold text-text-primary">
                  Orders
                </th>

                <th className="px-6 py-4 font-semibold text-text-primary">
                  Total Spent
                </th>

                <th className="px-6 py-4 font-semibold text-text-primary">
                  Status
                </th>

                <th className="px-6 py-4 font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-border-default last:border-0"
                >
                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 font-semibold text-brand-primary">
                        {customer.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-text-primary">
                          {customer.name}
                        </p>

                        <p className="text-xs text-text-muted">
                          ID #{customer.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Mail className="h-3.5 w-3.5 text-text-muted" />
                        <span>{customer.email}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-text-secondary">
                        {customer.company}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {customer.address}
                      </p>
                    </div>
                  </td>

                  {/* Orders */}
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {customer.totalOrders}
                  </td>

                  {/* Spent */}
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {formatCurrency(customer.totalSpent)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${customer.status === 'Active'
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-red-400/10 text-red-400'
                        }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(customer)
                        }
                        className="rounded-lg border border-border-default p-2 text-text-muted transition-colors hover:text-text-primary"
                        title="Edit customer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(customer.id)
                        }
                        className="rounded-lg border border-border-default p-2 text-red-400 transition-colors hover:bg-red-400/10"
                        title="Delete customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-sm text-text-muted"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-default px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary">
                  {editingCustomer
                    ? 'Edit Customer'
                    : 'Add Customer'}
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {editingCustomer
                    ? 'Update customer information.'
                    : 'Create a new customer account.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    htmlFor="customer-name"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Customer Name
                  </label>

                  <input
                    id="customer-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="customer-email"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Email
                    </label>

                    <input
                      id="customer-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="customer@example.com"
                      className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customer-phone"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Phone
                    </label>

                    <input
                      id="customer-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+62 812-3456-7890"
                      className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label
                    htmlFor="customer-company"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Company
                  </label>

                  <input
                    id="customer-company"
                    type="text"
                    value={form.company}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        company: event.target.value,
                      }))
                    }
                    placeholder="e.g. John Creative"
                    className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="customer-address"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Address
                  </label>

                  <textarea
                    id="customer-address"
                    rows={3}
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder="Customer address..."
                    className="w-full resize-none rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="customer-status"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Status
                  </label>

                  <select
                    id="customer-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as
                          | 'Active'
                          | 'Inactive',
                      }))
                    }
                    className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                {editingCustomer && (
                  <div className="rounded-lg border border-border-default bg-bg-base px-4 py-3">
                    <p className="text-xs text-text-muted">
                      Customer statistics
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-muted">
                          Total Orders
                        </p>

                        <p className="mt-1 font-semibold text-text-primary">
                          {editingCustomer.totalOrders}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-text-muted">
                          Total Spent
                        </p>

                        <p className="mt-1 font-semibold text-text-primary">
                          {formatCurrency(
                            editingCustomer.totalSpent,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-border-default px-6 py-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
                >
                  {editingCustomer
                    ? 'Save Changes'
                    : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="mb-3 flex items-center gap-2 text-brand-primary">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="text-2xl font-bold text-text-primary">
        {value}
      </p>
    </div>
  )
}
