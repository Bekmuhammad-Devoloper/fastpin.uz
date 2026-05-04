import { Button, Paper, Typography } from '@mui/material'
import type { IPayment } from '../../types/payment/payment'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridCellParams, GridRowClassNameParams } from '@mui/x-data-grid'
import { useState } from 'react'
import type { GridRowSelectionModel } from '@mui/x-data-grid'
import { useTranslationStore } from '../../store/language/useTranslationStore'
import { useTokenStore } from '../../store/token/useTokenStore'
import { deletePayment } from '../../api/payment/payment'
import LoadingProgress from '../Loading/LoadingProgress'
import { useNavigate } from 'react-router-dom'

const columns: GridColDef[] = [
	{ align: 'center', field: 'id', headerName: 'ID', width: 80 },
	{ align: 'center', field: 'minute', headerName: 'min', width: 60 },
	{ align: 'center', field: 'hour', headerName: 'hour', width: 60 },
	{ align: 'center', field: 'day', headerName: 'day', width: 60 },
	{ align: 'center', field: 'month', headerName: 'mon', width: 60 },
	{ align: 'center', field: 'year', headerName: 'year', width: 70 },
	{
		align: 'center',
		field: 'userId',
		headerName: 'userId',
		flex: 1,
		minWidth: 120,
		renderCell: (params) =>
			params.value ? (
				<Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: 11 }}>
					{params.value}
				</Typography>
			) : (
				<Typography variant='caption' color='warning.main' fontWeight={700}>
					— не забронировано
				</Typography>
			),
	},
	{
		field: 'sender',
		headerName: 'Отправитель',
		width: 130,
		renderCell: (params) =>
			params.value ? (
				<Typography variant='caption' color='info.main'>
					{params.value}
				</Typography>
			) : null,
	},
	{
		field: 'price',
		headerName: 'price',
		align: 'center',
		width: 90,
	},
]

const paginationModel = { page: 0, pageSize: 20 }

const SelectBooking = ({ data = [] }: { data?: IPayment[] }) => {
	const { t } = useTranslationStore()
	const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>()
	const { token } = useTokenStore()
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	return (
		<>
			{loading && <LoadingProgress />}
			<Button
				onClick={async () => {
					if (!selectionModel) return
					let selectedRows: IPayment[]
					if (selectionModel.type === 'include') {
						selectedRows = data.filter(row => selectionModel.ids.has(row.id))
					} else {
						selectedRows = data.filter(row => !selectionModel.ids.has(row.id))
					}
					if (selectedRows.length === 0) return
					const conf = confirm(`${t.delete}? - ${selectedRows.length}`)
					if (conf) {
						setLoading(true)
						for (const id of selectedRows) {
							await deletePayment({ token, id: id.id })
						}
						setLoading(false)
					}
				}}
				fullWidth
				variant='contained'
				color='error'
				sx={{ my: 2 }}
			>
				{t.delete}
			</Button>
			<Paper sx={{ width: '100%' }}>
				<DataGrid
					rows={data}
					columns={columns}
					initialState={{ pagination: { paginationModel } }}
					pageSizeOptions={[20, 25, 50, 75, 100]}
					checkboxSelection
					getRowClassName={(params: GridRowClassNameParams<IPayment>) =>
						!params.row.userId ? 'row-unmatched' : ''
					}
					sx={{
						border: 0,
						'& .row-unmatched': {
							bgcolor: 'rgba(255, 152, 0, 0.08)',
						},
						'& .MuiDataGrid-cell[data-field="userId"]': { cursor: 'pointer' },
					}}
					onRowSelectionModelChange={newSelection =>
						setSelectionModel(newSelection)
					}
					rowSelectionModel={selectionModel}
					onCellDoubleClick={(params: GridCellParams) => {
						if (params.field === 'userId' && params.value) {
							navigate(`/users/${params.value}`)
						}
					}}
				/>
			</Paper>
		</>
	)
}

export default SelectBooking
