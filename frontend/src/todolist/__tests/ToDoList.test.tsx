import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ToDoListPage} from "../ToDoListPage";
import {expect} from "vitest";
import * as toDoService from '../ToDoService'

describe('ToDoList', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should send new to do when add button clicked', async () => {
        const newToDo = 'new Task';
        vi.spyOn(toDoService, 'fetchToDos').mockResolvedValue([]);
        const mockCreateToDo = vi.spyOn(toDoService, 'createToDo').mockResolvedValueOnce({id: 10, text: newToDo, status: 'active'});
        render(<ToDoListPage/>)
        const taskInput = screen.getByLabelText('Task');
        await userEvent.type(taskInput, newToDo);
        const addButton = screen.getByRole('button', {name: 'Add'});
        await userEvent.click(addButton);
        expect(mockCreateToDo).toHaveBeenCalledWith(newToDo);
        expect(mockCreateToDo).toHaveBeenCalledOnce();
        expect(screen.getByLabelText('Task')).toHaveValue('');
        expect(await screen.findByText(newToDo)).toBeVisible()
    });

    it('should not call createToDo if no text has been entered', async () => {
        vi.spyOn(toDoService, 'fetchToDos').mockResolvedValue([]);
        const mockCreateToDo = vi.spyOn(toDoService, 'createToDo')
            .mockRejectedValue('createToDo was called, but should not have been');
        render(<ToDoListPage/>)
        const addButton = screen.getByRole('button', {name: 'Add'});
        await userEvent.click(addButton);
        expect(mockCreateToDo).not.toHaveBeenCalled();
    });

    it('should display existing tasks with checkboxes checked if complete', async () => {
        const expected = [
            {id: 10, text: 'incomplete task', status: 'active'},
            {id: 11, text: 'complete task', status: 'complete'},
        ]
        const mockFetchToDos = vi.spyOn(toDoService, 'fetchToDos')
            .mockResolvedValue(expected);

        render(<ToDoListPage/>)
        expect(mockFetchToDos).toHaveBeenCalledOnce();
        expect(await screen.findByText('incomplete task')).toBeVisible();
        expect(await screen.findByText('complete task')).toBeVisible();
        const checkboxes = await screen.findAllByRole('checkbox');
        expect(checkboxes[0]).not.toBeChecked();
        expect(checkboxes[1]).toBeChecked();
    });
    it('should call delete todo when delete button is clicked', async () => {
        const expected=[
            {id: 10, text: 'imcomplete task', status: 'active'},
            {id: 11, text: 'complete task', status: 'complete'},
        ]
        const mockFetchToDos=vi.spyOn(toDoService,'fetchToDos')
            .mockResolvedValue(expected);
        const mockDeleteToDo = vi.spyOn(toDoService, 'deleteToDo')
            .mockResolvedValue();
        render(<ToDoListPage/>);
        const listItems=await screen.findAllByRole('listitem');
        const toDoToDelete=listItems[0];
        await userEvent.click(within(toDoToDelete).getByLabelText('delete-button'))

        expect(mockDeleteToDo).toHaveBeenCalledOnce();
        expect(mockDeleteToDo).toHaveBeenCalledWith(10);

        expect(mockFetchToDos).toBeCalledTimes(2);
    });
});